import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LightingController } from '../src/controller';
import { PreferenceStorage } from '../src/persistence/preferences';
import { DEFAULT_SETTINGS } from '../src/domain/lighting';
import { peripheral } from './peripheral';
import { packetHex } from '../src/protocol/bojia';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });
const setup = () => {
  const p = peripheral(); const storage = new PreferenceStorage(() => ({ getItem: () => JSON.stringify({ version: 1, selected: DEFAULT_SETTINGS, favourites: [] }), setItem: vi.fn() }));
  return { ...p, app: new LightingController(p.session, storage, p.diagnostics) };
};

describe('user intent and restoration', () => {
  it('restoration, subscriptions and connect send no lighting commands', async () => {
    const p = setup(); const unsubscribe = p.app.subscribe(() => {}); unsubscribe();
    p.app.subscribe(() => {}); await p.session.connect(); await vi.advanceTimersByTimeAsync(1000);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    expect(p.app.getSnapshot().requestedPower).toBe('unknown');
  });
  it('allows disconnected edits and uses explicit On for a prepared setting after connection', async () => {
    const p = setup(); p.app.select({ rgb: [0, 255, 0], brightness: 50 }); await p.session.connect();
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    p.app.power('on'); await vi.advanceTimersByTimeAsync(0);
    expect(packetHex(p.characteristic.writeValueWithoutResponse.mock.calls[0][0])).toBe('69 96 06 01 01 00 FF 00 7F');
  });
  it('prepares colours after Off and On uses the current unscaled RGB and brightness', async () => {
    const p = setup(); await p.session.connect();
    p.app.power('off'); await vi.advanceTimersByTimeAsync(0);
    p.app.select({ rgb: [0, 0, 255], brightness: 25 }); await vi.advanceTimersByTimeAsync(500);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
    p.app.power('on'); await vi.advanceTimersByTimeAsync(0);
    expect(packetHex(p.characteristic.writeValueWithoutResponse.mock.calls[1][0])).toBe('69 96 06 01 01 00 00 FF 3F');
    expect(p.app.getSnapshot().message).toContain('On command sent');
  });
  it('draft slider changes never send commands before commit', async () => {
    const p = setup(); await p.session.connect();
    p.app.select({ ...DEFAULT_SETTINGS, brightness: 75 }, false); await vi.advanceTimersByTimeAsync(1000);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    p.app.commit(); await vi.advanceTimersByTimeAsync(0);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledOnce();
  });
  it('can add, rename, replace and delete a favourite without sending commands', async () => {
    const p = setup(); await p.session.connect();
    expect(p.app.saveFavourite('Evening')).toBe(true);
    const id = p.app.getSnapshot().preferences.favourites[0].id;
    p.app.renameFavourite(id, 'Reading');
    p.app.select({ rgb: [255, 0, 0], brightness: 25 }, false);
    p.app.saveFavourite('Reading', id);
    expect(p.app.getSnapshot().preferences.favourites[0].settings.brightness).toBe(25);
    p.app.deleteFavourite(id);
    expect(p.app.getSnapshot().preferences.favourites).toEqual([]);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
});
