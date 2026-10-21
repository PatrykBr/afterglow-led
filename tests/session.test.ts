import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { peripheral, deferred } from './peripheral';
import { CHARACTERISTIC, SERVICE, packetHex } from '../src/protocol/bojia';
import { DEFAULT_SETTINGS } from '../src/domain/lighting';

const colour = { kind: 'colour' as const, settings: DEFAULT_SETTINGS };
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('session and command lifecycle', () => {
  it('filters by name, grants optional service, discovers EE01 and sends nothing on connect', async () => {
    const p = peripheral();
    await p.session.connect();
    expect(p.access.requestDevice).toHaveBeenCalledWith({ filters: [{ namePrefix: 'BJ_LED' }], optionalServices: [SERVICE] });
    expect(p.server.getPrimaryService).toHaveBeenCalledWith(SERVICE);
    expect(p.service.getCharacteristic).toHaveBeenCalledWith(CHARACTERISTIC);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    expect(p.session.getSnapshot().state).toBe('connected');
  });
  it('reuses one device for multiple controls and rediscovers after reconnect without replay', async () => {
    const p = peripheral(); await p.session.connect();
    const a = p.session.submit(colour); await vi.advanceTimersByTimeAsync(1); await a;
    const b = p.session.submit({ kind: 'off' }); await vi.advanceTimersByTimeAsync(80); await b;
    const c = p.session.submit({ kind: 'on', settings: DEFAULT_SETTINGS }); await vi.advanceTimersByTimeAsync(80); await c;
    expect(p.access.requestDevice).toHaveBeenCalledTimes(1);
    const close = p.session.disconnect(); await vi.advanceTimersByTimeAsync(3000); await close;
    await p.session.connect();
    expect(p.access.requestDevice).toHaveBeenCalledTimes(1);
    expect(p.server.getPrimaryService).toHaveBeenCalledTimes(2);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(3);
  });
  it('spaces writes at least 80 ms after completion', async () => {
    const p = peripheral(); await p.session.connect();
    const first = p.session.submit(colour); await vi.advanceTimersByTimeAsync(0); await first;
    const second = p.session.submit({ kind: 'off' });
    await vi.advanceTimersByTimeAsync(79); expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1); await second; expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(2);
  });
  it('Off cancels unsent colours, preserves power order and follows the in-flight write', async () => {
    const p = peripheral(); await p.session.connect();
    const gate = deferred<void>(); p.characteristic.writeValueWithoutResponse.mockImplementationOnce(() => gate.promise);
    const inFlight = p.session.submit(colour); await vi.advanceTimersByTimeAsync(0);
    const stale = p.session.submit(colour);
    const off = p.session.submit({ kind: 'off' });
    const on = p.session.submit({ kind: 'on', settings: DEFAULT_SETTINGS });
    expect((await stale).status).toBe('cancelled');
    gate.resolve(); await vi.advanceTimersByTimeAsync(160);
    await Promise.all([inFlight, off, on]);
    const frames = p.characteristic.writeValueWithoutResponse.mock.calls.map(([data]) => packetHex(data));
    expect(frames.map(frame => frame.split(' ').slice(2, 5).join(' '))).toEqual(['05 02 7F', '02 01 00', '06 01 01']);
  });
  it('coalesces only trailing unsent colour selections', async () => {
    const p = peripheral(); await p.session.connect();
    const a = p.session.submit(colour);
    const b = p.session.submit({ kind: 'colour', settings: { rgb: [0, 0, 255], brightness: 100 } });
    expect((await a).status).toBe('cancelled');
    await vi.advanceTimersByTimeAsync(0); await b;
    expect(packetHex(p.characteristic.writeValueWithoutResponse.mock.calls[0][0])).toBe('69 96 05 02 00 00 FF FF');
  });
  it('holds the final write for three seconds before normal disconnect', async () => {
    const p = peripheral(); await p.session.connect();
    const sent = p.session.submit(colour); await vi.advanceTimersByTimeAsync(0); await sent;
    const close = p.session.disconnect();
    expect(p.session.getSnapshot().state).toBe('disconnecting');
    expect((await p.session.submit(colour)).status).toBe('failed');
    await vi.advanceTimersByTimeAsync(2999); expect(p.server.disconnect).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); await close;
    expect(p.server.disconnect).toHaveBeenCalledOnce();
    expect(p.session.getSnapshot().state).toBe('disconnected');
  });
  it('starts the disconnect hold from actual completion of an in-flight write', async () => {
    const p = peripheral(); await p.session.connect();
    const gate = deferred<void>(); p.characteristic.writeValueWithoutResponse.mockImplementationOnce(() => gate.promise);
    const write = p.session.submit(colour); await vi.advanceTimersByTimeAsync(0);
    const close = p.session.disconnect();
    await vi.advanceTimersByTimeAsync(500); gate.resolve(); await vi.advanceTimersByTimeAsync(2999);
    expect(p.server.disconnect).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); await close;
    expect((await write).status).toBe('uncertain');
  });
  it('waits up to 1.2 seconds for asynchronous disconnect confirmation', async () => {
    const p = peripheral(); await p.session.connect();
    p.server.disconnect.mockImplementation(() => { p.server.connected = false; });
    const close = p.session.disconnect(); await vi.advanceTimersByTimeAsync(1199);
    expect(p.session.getSnapshot().state).toBe('disconnecting');
    await vi.advanceTimersByTimeAsync(1); await close;
    expect(p.session.getSnapshot().state).toBe('disconnected');
  });
  it('marks an eight-second write timeout uncertain and cancels queued commands without retry', async () => {
    const p = peripheral(); await p.session.connect();
    const gate = deferred<void>(); p.characteristic.writeValueWithoutResponse.mockImplementationOnce(() => gate.promise);
    const write = p.session.submit(colour); await vi.advanceTimersByTimeAsync(0);
    const queued = p.session.submit({ kind: 'off' });
    await vi.advanceTimersByTimeAsync(8000);
    expect((await write).status).toBe('uncertain'); expect((await queued).status).toBe('cancelled');
    expect(p.session.getSnapshot().state).toBe('disconnected');
    expect(p.session.getSnapshot().error).toContain('No automatic retry');
    await p.session.connect(); gate.resolve(); await vi.advanceTimersByTimeAsync(10000);
    expect(p.session.getSnapshot().state).toBe('connected');
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
  });
  it('clears the old characteristic after link loss and never replays queued work', async () => {
    const p = peripheral(); await p.session.connect();
    const queued = p.session.submit(colour); p.server.disconnect();
    expect((await queued).status).toBe('cancelled');
    await p.session.connect(); await vi.advanceTimersByTimeAsync(500);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    expect(p.session.getSnapshot().state).toBe('connected');
  });
  it('handles permission denial and cancelled selection', async () => {
    const p = peripheral(); p.access.requestDevice.mockRejectedValueOnce(new DOMException('cancelled', 'NotFoundError'));
    await p.session.connect(); expect(p.session.getSnapshot().error).toContain('No device selected');
    p.access.requestDevice.mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'));
    await p.session.connect(); expect(p.session.getSnapshot().error).toContain('permission');
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
  it('limits connection/discovery to 15 seconds after selection, not during the chooser', async () => {
    const p = peripheral(); const selection = deferred<BluetoothDevice>(); p.access.requestDevice.mockImplementationOnce(() => selection.promise);
    const discovery = deferred<typeof p.server>(); p.server.connect.mockImplementationOnce(() => discovery.promise);
    const connect = p.session.connect(); await vi.advanceTimersByTimeAsync(30000);
    expect(p.session.getSnapshot().state).toBe('connecting');
    selection.resolve(p.device); await vi.advanceTimersByTimeAsync(15000); await connect;
    expect(p.session.getSnapshot().error).toContain('timed out');
    discovery.resolve(p.server); await vi.advanceTimersByTimeAsync(0);
    expect(p.service.getCharacteristic).not.toHaveBeenCalled();
    expect(p.session.getSnapshot().state).toBe('disconnected');
  });
  it('late discovery cannot replace a newer connection', async () => {
    const p = peripheral(); const gate = deferred<typeof p.service>();
    p.server.getPrimaryService.mockImplementationOnce(() => gate.promise);
    const old = p.session.connect(); await vi.advanceTimersByTimeAsync(15000); await old;
    await p.session.connect(); expect(p.session.getSnapshot().state).toBe('connected');
    gate.resolve(p.service); await vi.advanceTimersByTimeAsync(0);
    expect(p.session.getSnapshot().state).toBe('connected');
    expect(p.service.getCharacteristic).toHaveBeenCalledTimes(1);
  });
  it('refuses an unsupported write channel', async () => {
    const p = peripheral(); p.characteristic.properties.writeWithoutResponse = false;
    await p.session.connect(); expect(p.session.getSnapshot().error).toContain('verified LED write channel');
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
});
