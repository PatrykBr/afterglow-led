import { CHARACTERISTIC, SERVICE, type Command } from '../protocol/bojia';
import { bounded, CancelledError, delay } from './async';
import { CommandScheduler, type Outcome } from './scheduler';
import type { Diagnostics } from '../diagnostics';
import { canonicalBluetoothUuid } from './uuid';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
export type SessionSnapshot = {
  state: ConnectionState;
  hasDevice: boolean;
  deviceName?: string;
  pending: number;
  error?: string;
};
export type BluetoothAccess = Pick<Bluetooth, 'requestDevice'>;

export function explainConnectionError(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  if (name === 'NotFoundError') return 'No device selected. Tap Connect to choose BJ_LED_M.';
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Bluetooth permission was denied. Allow Bluetooth for Bluefy in iPhone Settings, then tap Connect.';
  if (name === 'DeadlineError')
    return 'Connection timed out. Keep the strip powered and nearby, close other controllers, then try Reconnect.';
  if (name === 'NetworkError')
    return 'The strip is unavailable. Move closer, check its power and close other apps connected to it.';
  return error instanceof Error
    ? error.message
    : 'Could not connect. Check Bluetooth and try again.';
}

/** Owns all browser Bluetooth objects. Construct once, outside React. */
export class BluetoothSession {
  private snapshot: SessionSnapshot = { state: 'disconnected', hasDevice: false, pending: 0 };
  private listeners = new Set<() => void>();
  private device?: BluetoothDevice;
  private generation = 0;
  private attempt = new AbortController();
  private disconnectTask?: Promise<void>;
  private scheduler: CommandScheduler;

  constructor(
    private access: () => BluetoothAccess | undefined,
    private diagnostics: Diagnostics,
  ) {
    this.scheduler = new CommandScheduler(
      diagnostics,
      (message) => this.fail(message),
      (pending) => this.patch({ pending }),
    );
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private patch(patch: Partial<SessionSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((fn) => fn());
  }

  async connect(selectAgain = false): Promise<void> {
    if (this.snapshot.state !== 'disconnected') return;
    const bluetooth = this.access();
    if (!bluetooth) {
      this.patch({
        error:
          'Open the HTTPS site in Bluefy on your iPhone. This browser cannot access Bluetooth.',
      });
      return;
    }
    const generation = ++this.generation;
    this.attempt = new AbortController();
    this.patch({ state: 'connecting', error: undefined });
    this.diagnostics.add(
      'connecting',
      selectAgain ? 'new selection' : 'selected device if available',
    );
    try {
      // No await before requestDevice: it must run inside the user's tap gesture.
      const selected =
        selectAgain || !this.device
          ? await bluetooth.requestDevice({
              filters: [{ namePrefix: 'BJ_LED' }],
              optionalServices: [SERVICE],
            })
          : this.device;
      if (generation !== this.generation) return;
      if (selected !== this.device) {
        this.device?.removeEventListener('gattserverdisconnected', this.onLost);
        this.device = selected;
        selected.addEventListener('gattserverdisconnected', this.onLost);
      }
      this.patch({ hasDevice: true, deviceName: selected.name || 'BJ_LED controller' });
      if (!selected.gatt)
        throw new Error('This device has no available GATT server. Choose BJ_LED_M.');
      const discovery = this.discover(selected, generation);
      const characteristic = await bounded(discovery, 15000, this.attempt.signal);
      if (generation !== this.generation) return;
      this.scheduler.activate(async (bytes) => {
        if (generation !== this.generation || this.snapshot.state !== 'connected')
          throw new CancelledError();
        await characteristic.writeValueWithoutResponse(bytes);
      });
      this.patch({ state: 'connected', error: undefined });
      this.diagnostics.add('connected', 'EEA0 / EE01; no lighting commands sent');
    } catch (error) {
      if (generation !== this.generation) return;
      this.fail(explainConnectionError(error));
    }
  }

  private async discover(device: BluetoothDevice, generation: number) {
    const server = await device.gatt!.connect();
    if (generation !== this.generation) {
      if (device !== this.device || this.snapshot.state === 'disconnected') server.disconnect();
      throw new CancelledError();
    }
    const service = await server.getPrimaryService(SERVICE);
    if (generation !== this.generation) throw new CancelledError();
    const serviceUuid = canonicalBluetoothUuid(service.uuid);
    this.diagnostics.add(
      'service-discovered',
      JSON.stringify({ reported: service.uuid, canonical: serviceUuid ?? null }),
    );
    if (serviceUuid !== SERVICE)
      throw new Error(
        'This device does not support the required LED service. Copy diagnostics for troubleshooting.',
      );
    const characteristic = await service.getCharacteristic(CHARACTERISTIC);
    if (generation !== this.generation) throw new CancelledError();
    const characteristicUuid = canonicalBluetoothUuid(characteristic.uuid);
    this.diagnostics.add(
      'characteristic-discovered',
      JSON.stringify({
        reported: characteristic.uuid,
        canonical: characteristicUuid ?? null,
        writeWithoutResponse: characteristic.properties.writeWithoutResponse,
      }),
    );
    if (
      characteristicUuid !== CHARACTERISTIC ||
      !characteristic.properties.writeWithoutResponse ||
      typeof characteristic.writeValueWithoutResponse !== 'function'
    ) {
      throw new Error('This device does not support LED writes. Choose BJ_LED_M.');
    }
    return characteristic;
  }

  submit(command: Command): Promise<Outcome> {
    return this.scheduler.enqueue(command);
  }

  disconnect(): Promise<void> {
    if (this.disconnectTask) return this.disconnectTask;
    if (this.snapshot.state === 'disconnected') return Promise.resolve();
    this.generation++;
    this.attempt.abort();
    this.scheduler.stop();
    this.patch({ state: 'disconnecting', error: undefined });
    this.disconnectTask = this.finishDisconnect().finally(() => {
      this.disconnectTask = undefined;
    });
    return this.disconnectTask;
  }

  private async finishDisconnect() {
    await this.scheduler.settle();
    const activity = this.scheduler.lastActivity;
    if (activity !== null) await delay(Math.max(0, activity + 3000 - Date.now()));
    const server = this.device?.gatt;
    if (server?.connected) {
      let confirm!: () => void;
      const confirmation = new Promise<void>((resolve) => {
        confirm = resolve;
      });
      const device = this.device!;
      device.addEventListener('gattserverdisconnected', confirm, { once: true });
      try {
        server.disconnect();
        await bounded(confirmation, 1200).catch(() => {});
      } finally {
        device.removeEventListener('gattserverdisconnected', confirm);
      }
    }
    this.patch({ state: 'disconnected', pending: 0 });
    this.diagnostics.add('disconnected', 'normal; last write hold preserved');
  }

  private onLost = () => {
    if (this.snapshot.state === 'disconnecting' || this.snapshot.state === 'disconnected') return;
    this.fail('Connection lost. Tap Reconnect. Your selection is unchanged.');
  };
  private fail(message: string) {
    this.generation++;
    this.attempt.abort();
    this.scheduler.stop();
    // Error teardown is immediate. The normal disconnect hold is not a retry policy.
    this.patch({ state: 'disconnected', error: message, pending: 0 });
    this.device?.gatt?.disconnect();
    this.diagnostics.add('connection-error', message);
  }
  resume() {
    if (this.snapshot.state === 'connected' && !this.device?.gatt?.connected) this.onLost();
    this.diagnostics.add('page-visible', 'No commands replayed.');
  }
}
