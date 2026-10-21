import { vi } from 'vitest';
import { BluetoothSession } from '../src/bluetooth/session';
import { Diagnostics } from '../src/diagnostics';
import { CHARACTERISTIC, SERVICE } from '../src/protocol/bojia';

export function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

export function peripheral() {
  const device = new EventTarget() as BluetoothDevice;
  Object.defineProperty(device, 'name', { value: 'BJ_LED_M' });
  const characteristic = { uuid: CHARACTERISTIC, properties: { writeWithoutResponse: true }, writeValueWithoutResponse: vi.fn(async (_bytes: Uint8Array) => {}) };
  const service = { uuid: SERVICE, getCharacteristic: vi.fn(async () => characteristic) };
  const server = {
    connected: false,
    connect: vi.fn(async () => { server.connected = true; return server; }),
    getPrimaryService: vi.fn(async () => service),
    disconnect: vi.fn(() => { const wasConnected = server.connected; server.connected = false; if (wasConnected) device.dispatchEvent(new Event('gattserverdisconnected')); }),
  };
  Object.defineProperty(device, 'gatt', { value: server });
  const access = { requestDevice: vi.fn(async (_options: RequestDeviceOptions) => device) };
  const diagnostics = new Diagnostics();
  const session = new BluetoothSession(() => access, diagnostics);
  return { device, server, characteristic, service, access, diagnostics, session };
}
