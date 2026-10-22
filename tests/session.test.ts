import { installClock, type TestClock } from './clock';
let clock: TestClock;
import { afterEach, beforeEach, describe, expect, it, vi } from 'bun:test';
import { peripheral, deferred } from './peripheral';
import { CHARACTERISTIC, SERVICE, packetHex } from '../src/protocol/bojia';
import { DEFAULT_SETTINGS } from '../src/domain/lighting';

const colour = { kind: 'colour' as const, settings: DEFAULT_SETTINGS };
beforeEach(() => {
  clock = installClock();
});
afterEach(() => {
  clock.uninstall();
});

describe('session and command lifecycle', () => {
  it.each([
    ['eea0', 'ee01'],
    ['EEA0', 'EE01'],
    ['0000EEA0', '0000EE01'],
    ['0xEEA0', '0xEE01'],
    ['0000EEA000001000800000805F9B34FB', '0000EE0100001000800000805F9B34FB'],
    [SERVICE.toUpperCase(), CHARACTERISTIC.toUpperCase()],
  ])('accepts equivalent Bluetooth UUID forms %s / %s', async (serviceUuid, characteristicUuid) => {
    const p = peripheral();
    p.service.uuid = serviceUuid;
    p.characteristic.uuid = characteristicUuid;
    await p.session.connect();
    expect(p.session.getSnapshot().error).toBeUndefined();
    expect(p.session.getSnapshot().state).toBe('connected');
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
  it.each(['ee02', 'eea0ffff', '0000eea0-0000-1000-8000-00805f9b34fc', '', 'not-a-uuid'])(
    'still rejects the wrong or invalid service %s',
    async (uuid) => {
      const p = peripheral();
      p.service.uuid = uuid;
      await p.session.connect();
      expect(p.session.getSnapshot().state).toBe('disconnected');
      expect(p.session.getSnapshot().error).toContain('does not expose the verified LED service');
      expect(p.service.getCharacteristic).not.toHaveBeenCalled();
      expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    },
  );
  it('still rejects EE02 even when the service is reported as a short UUID', async () => {
    const p = peripheral();
    p.service.uuid = 'EEA0';
    p.characteristic.uuid = 'EE02';
    await p.session.connect();
    expect(p.session.getSnapshot().error).toContain('verified LED write channel');
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
  it('records the bridge UUIDs in exported diagnostics', async () => {
    const p = peripheral();
    p.service.uuid = 'EEA0';
    p.characteristic.uuid = 'EE01';
    await p.session.connect();
    const entries = JSON.parse(p.diagnostics.export()).entries;
    expect(entries).toContainEqual(
      expect.objectContaining({
        event: 'service-discovered',
        detail: JSON.stringify({ reported: 'EEA0', canonical: SERVICE }),
      }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        event: 'characteristic-discovered',
        detail: JSON.stringify({
          reported: 'EE01',
          canonical: CHARACTERISTIC,
          writeWithoutResponse: true,
        }),
      }),
    );
  });
  it('filters by name, grants optional service, discovers EE01 and sends nothing on connect', async () => {
    const p = peripheral();
    await p.session.connect();
    expect(p.access.requestDevice).toHaveBeenCalledWith({
      filters: [{ namePrefix: 'BJ_LED' }],
      optionalServices: [SERVICE],
    });
    expect(p.server.getPrimaryService).toHaveBeenCalledWith(SERVICE);
    expect(p.service.getCharacteristic).toHaveBeenCalledWith(CHARACTERISTIC);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    expect(p.session.getSnapshot().state).toBe('connected');
  });
  it('reuses one device for multiple controls and rediscovers after reconnect without replay', async () => {
    const p = peripheral();
    await p.session.connect();
    const a = p.session.submit(colour);
    await clock.tickAsync(1);
    await a;
    const b = p.session.submit({ kind: 'off' });
    await clock.tickAsync(80);
    await b;
    const c = p.session.submit({ kind: 'on', settings: DEFAULT_SETTINGS });
    await clock.tickAsync(80);
    await c;
    expect(p.access.requestDevice).toHaveBeenCalledTimes(1);
    const close = p.session.disconnect();
    await clock.tickAsync(3000);
    await close;
    await p.session.connect();
    expect(p.access.requestDevice).toHaveBeenCalledTimes(1);
    expect(p.server.getPrimaryService).toHaveBeenCalledTimes(2);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(3);
  });
  it('spaces writes at least 80 ms after completion', async () => {
    const p = peripheral();
    await p.session.connect();
    const first = p.session.submit(colour);
    await clock.tickAsync(0);
    await first;
    const second = p.session.submit({ kind: 'off' });
    await clock.tickAsync(79);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
    await clock.tickAsync(1);
    await second;
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(2);
  });
  it('Off cancels unsent colours, preserves power order and follows the in-flight write', async () => {
    const p = peripheral();
    await p.session.connect();
    const gate = deferred<void>();
    p.characteristic.writeValueWithoutResponse.mockImplementationOnce(() => gate.promise);
    const inFlight = p.session.submit(colour);
    await clock.tickAsync(0);
    const stale = p.session.submit(colour);
    const off = p.session.submit({ kind: 'off' });
    const on = p.session.submit({ kind: 'on', settings: DEFAULT_SETTINGS });
    expect((await stale).status).toBe('cancelled');
    gate.resolve();
    await clock.tickAsync(160);
    await Promise.all([inFlight, off, on]);
    const frames = p.characteristic.writeValueWithoutResponse.mock.calls.map(([data]) =>
      packetHex(data),
    );
    expect(frames.map((frame) => frame.split(' ').slice(2, 5).join(' '))).toEqual([
      '05 02 7F',
      '02 01 00',
      '06 01 01',
    ]);
  });
  it('coalesces only trailing unsent colour selections', async () => {
    const p = peripheral();
    await p.session.connect();
    const a = p.session.submit(colour);
    const b = p.session.submit({ kind: 'colour', settings: { rgb: [0, 0, 255], brightness: 100 } });
    expect((await a).status).toBe('cancelled');
    await clock.tickAsync(0);
    await b;
    expect(packetHex(p.characteristic.writeValueWithoutResponse.mock.calls[0][0])).toBe(
      '69 96 05 02 00 00 FF FF',
    );
  });
  it('holds the final write for three seconds before normal disconnect', async () => {
    const p = peripheral();
    await p.session.connect();
    const sent = p.session.submit(colour);
    await clock.tickAsync(0);
    await sent;
    const close = p.session.disconnect();
    expect(p.session.getSnapshot().state).toBe('disconnecting');
    expect((await p.session.submit(colour)).status).toBe('failed');
    await clock.tickAsync(2999);
    expect(p.server.disconnect).not.toHaveBeenCalled();
    await clock.tickAsync(1);
    await close;
    expect(p.server.disconnect).toHaveBeenCalledTimes(1);
    expect(p.session.getSnapshot().state).toBe('disconnected');
  });
  it('starts the disconnect hold from actual completion of an in-flight write', async () => {
    const p = peripheral();
    await p.session.connect();
    const gate = deferred<void>();
    p.characteristic.writeValueWithoutResponse.mockImplementationOnce(() => gate.promise);
    const write = p.session.submit(colour);
    await clock.tickAsync(0);
    const close = p.session.disconnect();
    await clock.tickAsync(500);
    gate.resolve();
    await clock.tickAsync(2999);
    expect(p.server.disconnect).not.toHaveBeenCalled();
    await clock.tickAsync(1);
    await close;
    expect((await write).status).toBe('uncertain');
  });
  it('waits up to 1.2 seconds for asynchronous disconnect confirmation', async () => {
    const p = peripheral();
    await p.session.connect();
    p.server.disconnect.mockImplementation(() => {
      p.server.connected = false;
    });
    const close = p.session.disconnect();
    await clock.tickAsync(1199);
    expect(p.session.getSnapshot().state).toBe('disconnecting');
    await clock.tickAsync(1);
    await close;
    expect(p.session.getSnapshot().state).toBe('disconnected');
  });
  it('marks an eight-second write timeout uncertain and cancels queued commands without retry', async () => {
    const p = peripheral();
    await p.session.connect();
    const gate = deferred<void>();
    p.characteristic.writeValueWithoutResponse.mockImplementationOnce(() => gate.promise);
    const write = p.session.submit(colour);
    await clock.tickAsync(0);
    const queued = p.session.submit({ kind: 'off' });
    await clock.tickAsync(8000);
    expect((await write).status).toBe('uncertain');
    expect((await queued).status).toBe('cancelled');
    expect(p.session.getSnapshot().state).toBe('disconnected');
    expect(p.session.getSnapshot().error).toContain('No automatic retry');
    await p.session.connect();
    gate.resolve();
    await clock.tickAsync(10000);
    expect(p.session.getSnapshot().state).toBe('connected');
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
  });
  it('clears the old characteristic after link loss and never replays queued work', async () => {
    const p = peripheral();
    await p.session.connect();
    const queued = p.session.submit(colour);
    p.server.disconnect();
    expect((await queued).status).toBe('cancelled');
    await p.session.connect();
    await clock.tickAsync(500);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    expect(p.session.getSnapshot().state).toBe('connected');
  });
  it('handles permission denial and cancelled selection', async () => {
    const p = peripheral();
    p.access.requestDevice.mockRejectedValueOnce(new DOMException('cancelled', 'NotFoundError'));
    await p.session.connect();
    expect(p.session.getSnapshot().error).toContain('No device selected');
    p.access.requestDevice.mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'));
    await p.session.connect();
    expect(p.session.getSnapshot().error).toContain('permission');
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
  it('limits connection/discovery to 15 seconds after selection, not during the chooser', async () => {
    const p = peripheral();
    const selection = deferred<BluetoothDevice>();
    p.access.requestDevice.mockImplementationOnce(() => selection.promise);
    const discovery = deferred<typeof p.server>();
    p.server.connect.mockImplementationOnce(() => discovery.promise);
    const connect = p.session.connect();
    await clock.tickAsync(30000);
    expect(p.session.getSnapshot().state).toBe('connecting');
    selection.resolve(p.device);
    await clock.tickAsync(15000);
    await connect;
    expect(p.session.getSnapshot().error).toContain('timed out');
    discovery.resolve(p.server);
    await clock.tickAsync(0);
    expect(p.service.getCharacteristic).not.toHaveBeenCalled();
    expect(p.session.getSnapshot().state).toBe('disconnected');
  });
  it('late discovery cannot replace a newer connection', async () => {
    const p = peripheral();
    const gate = deferred<typeof p.service>();
    p.server.getPrimaryService.mockImplementationOnce(() => gate.promise);
    const old = p.session.connect();
    await clock.tickAsync(15000);
    await old;
    await p.session.connect();
    expect(p.session.getSnapshot().state).toBe('connected');
    gate.resolve(p.service);
    await clock.tickAsync(0);
    expect(p.session.getSnapshot().state).toBe('connected');
    expect(p.service.getCharacteristic).toHaveBeenCalledTimes(1);
  });
  it('refuses an unsupported write channel', async () => {
    const p = peripheral();
    p.characteristic.properties.writeWithoutResponse = false;
    await p.session.connect();
    expect(p.session.getSnapshot().error).toContain('verified LED write channel');
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
});
