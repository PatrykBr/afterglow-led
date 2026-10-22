import { describe, expect, it } from 'bun:test';
import { PreferenceStorage, STORAGE_KEY } from '../src/persistence/preferences';
import { DEFAULT_SETTINGS } from '../src/domain/lighting';

describe('local preferences', () => {
  it('round trips a named favourite and selection without storing a power command', () => {
    const data = new Map<string, string>();
    const adapter = new PreferenceStorage(() => ({
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => {
        data.set(key, value);
      },
    }));
    const value = {
      version: 1 as const,
      selected: DEFAULT_SETTINGS,
      favourites: [{ id: 'evening', name: 'Evening', settings: DEFAULT_SETTINGS }],
    };
    expect(adapter.save(value)).toBeUndefined();
    expect(adapter.load().preferences).toEqual(value);
    expect(data.get(STORAGE_KEY)).not.toContain('power');
  });
  it.each([
    'broken JSON',
    '{"version":99}',
    JSON.stringify({ version: 1, selected: { rgb: [0, 0, 0], brightness: 0 }, favourites: [] }),
  ])('handles malformed data %s', (raw) => {
    const adapter = new PreferenceStorage(() => ({ getItem: () => raw, setItem: () => {} }));
    expect(adapter.load().warning).toBeTruthy();
    expect(adapter.load().preferences.selected).toEqual(DEFAULT_SETTINGS);
  });
  it('handles blocked storage and quota failures', () => {
    const adapter = new PreferenceStorage(() => {
      throw new Error('SecurityError');
    });
    expect(adapter.load().warning).toBeTruthy();
    expect(adapter.save(adapter.load().preferences)).toBeTruthy();
  });
  it('rejects duplicate favourite IDs', () => {
    const f = { id: 'same', name: 'Evening', settings: DEFAULT_SETTINGS };
    const adapter = new PreferenceStorage(() => ({
      getItem: () => JSON.stringify({ version: 1, selected: DEFAULT_SETTINGS, favourites: [f, f] }),
      setItem: () => {},
    }));
    expect(adapter.load().warning).toBeTruthy();
  });
});
