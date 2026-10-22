import { installClock, type TestClock } from './clock';
let clock: TestClock;
import { afterEach, beforeEach, describe, expect, it, vi } from 'bun:test';
import { LightingController } from '../src/controller';
import { PreferenceStorage } from '../src/persistence/preferences';
import { DEFAULT_SETTINGS } from '../src/domain/lighting';
import { peripheral } from './peripheral';
import { packetHex } from '../src/protocol/bojia';

beforeEach(() => {
  clock = installClock();
});
afterEach(() => {
  clock.uninstall();
});
const setup = () => {
  const p = peripheral();
  const setItem = vi.fn();
  const storage = new PreferenceStorage(() => ({
    getItem: () => JSON.stringify({ version: 1, selected: DEFAULT_SETTINGS, favourites: [] }),
    setItem,
  }));
  return { ...p, setItem, app: new LightingController(p.session, storage, p.diagnostics) };
};

describe('user intent and restoration', () => {
  it('restoration, subscriptions and connect send no lighting commands', async () => {
    const p = setup();
    const unsubscribe = p.app.subscribe(() => {});
    unsubscribe();
    p.app.subscribe(() => {});
    await p.session.connect();
    await clock.tickAsync(1000);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    expect(p.app.getSnapshot().requestedPower).toBe('unknown');
  });
  it('allows disconnected edits and uses explicit On for a prepared setting after connection', async () => {
    const p = setup();
    p.app.select({ rgb: [0, 255, 0], brightness: 50 });
    await p.session.connect();
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    expect(p.app.getSnapshot().message).toBe('Adjust a control or tap On to send this setting.');
    p.app.power('on');
    await clock.tickAsync(0);
    expect(packetHex(p.characteristic.writeValueWithoutResponse.mock.calls[0][0])).toBe(
      '69 96 06 01 01 00 FF 00 7F',
    );
  });
  it('prepares colours after Off and On uses the current unscaled RGB and brightness', async () => {
    const p = setup();
    await p.session.connect();
    p.app.power('off');
    await clock.tickAsync(0);
    p.app.select({ rgb: [0, 0, 255], brightness: 25 });
    await clock.tickAsync(500);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
    p.app.power('on');
    await clock.tickAsync(0);
    expect(packetHex(p.characteristic.writeValueWithoutResponse.mock.calls[1][0])).toBe(
      '69 96 06 01 01 00 00 FF 3F',
    );
    expect(p.app.getSnapshot().message).toContain('On command sent');
  });
  it('draft slider changes never send commands before commit', async () => {
    const p = setup();
    await p.session.connect();
    p.app.select({ ...DEFAULT_SETTINGS, brightness: 75 }, false);
    await clock.tickAsync(1000);
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
    p.app.commit();
    await clock.tickAsync(0);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
  });
  it('does not rewrite unchanged preferences on release or explicit repeat commands', async () => {
    const p = setup();
    await p.session.connect();
    const selected = { ...DEFAULT_SETTINGS, brightness: 75 };
    p.app.select(selected, false);
    p.app.select(selected, false);
    p.app.commit();
    await clock.tickAsync(0);
    p.app.commit();
    await clock.tickAsync(80);
    expect(p.setItem).toHaveBeenCalledTimes(1);
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(2);
    expect(p.app.getSnapshot().preferences.selected).toEqual(selected);
  });
  it('shows connection guidance after reconnect instead of an old command message', async () => {
    const p = setup();
    await p.session.connect();
    p.app.power('off');
    await clock.tickAsync(0);
    expect(p.app.getSnapshot().message).toContain('Off command sent');
    p.server.disconnect();
    await p.session.connect();
    expect(p.app.getSnapshot().message).toBe('Tap On to send this setting.');
    expect(p.app.getSnapshot().requestedPower).toBe('off');
    expect(p.characteristic.writeValueWithoutResponse).toHaveBeenCalledTimes(1);
  });
  it('keeps edits usable after a quota failure and retries saving on commit', () => {
    const p = setup();
    p.setItem.mockImplementationOnce(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    const selected = { ...DEFAULT_SETTINGS, brightness: 75 };
    p.app.select(selected, false);
    expect(p.app.getSnapshot().preferences.selected).toEqual(selected);
    expect(p.app.getSnapshot().storageWarning).toContain('could not save');
    p.app.commit();
    expect(p.setItem).toHaveBeenCalledTimes(2);
    expect(p.app.getSnapshot().storageWarning).toBeUndefined();
    expect(p.characteristic.writeValueWithoutResponse).not.toHaveBeenCalled();
  });
  it('can add, rename, replace and delete a favourite without sending commands', async () => {
    const p = setup();
    await p.session.connect();
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
