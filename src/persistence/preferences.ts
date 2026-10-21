import { DEFAULT_SETTINGS, validateSettings, type Settings } from '../domain/lighting';

export type Favourite = { id: string; name: string; settings: Settings };
export type Preferences = { version: 1; selected: Settings; favourites: Favourite[] };
type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
export const STORAGE_KEY = 'afterglow.preferences.v1';
const defaults = (): Preferences => ({ version: 1, selected: validateSettings(DEFAULT_SETTINGS), favourites: [] });
export function favouriteName(value: string) {
  const name = value.trim();
  if (!name || name.length > 40) throw new Error('Give your favourite a name from 1 to 40 characters.');
  return name;
}

export class PreferenceStorage {
  constructor(private storage: () => StorageAdapter | undefined) {}
  load(): { preferences: Preferences; warning?: string } {
    try {
      const storage = this.storage();
      if (!storage) throw new Error('Storage unavailable');
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return { preferences: defaults() };
      const data = JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.favourites) || data.favourites.length > 30) throw new Error('Invalid saved data');
      const seen = new Set<string>();
      const favourites: Favourite[] = data.favourites.map((f: Favourite) => {
        if (typeof f.id !== 'string' || !f.id || f.id.length > 100 || seen.has(f.id) || typeof f.name !== 'string') throw new Error('Invalid favourite');
        seen.add(f.id);
        return { id: f.id, name: favouriteName(f.name), settings: validateSettings(f.settings) };
      });
      return { preferences: { version: 1, selected: validateSettings(data.selected), favourites } };
    } catch {
      return { preferences: defaults(), warning: 'Saved settings could not be loaded. You can still use the controls; nothing was sent to the strip.' };
    }
  }
  save(preferences: Preferences): string | undefined {
    try {
      const storage = this.storage();
      if (!storage) throw new Error('Storage unavailable');
      storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch { return 'This browser could not save your settings. They will stay available until you close or reload this page.'; }
  }
}
