import { type RequestedPower, type Settings, validateSettings } from './domain/lighting';
import {
  type Favourite,
  type Preferences,
  PreferenceStorage,
  favouriteName,
} from './persistence/preferences';
import { type Command } from './protocol/bojia';
import { BluetoothSession, type SessionSnapshot } from './bluetooth/session';
import type { Diagnostics } from './diagnostics';

export type ControllerSnapshot = {
  preferences: Preferences;
  session: SessionSnapshot;
  requestedPower: RequestedPower;
  lastSubmitted?: Settings;
  message: string;
  storageWarning?: string;
};

export class LightingController {
  private snapshot: ControllerSnapshot;
  private listeners = new Set<() => void>();
  private feedbackId = 0;
  constructor(
    readonly session: BluetoothSession,
    private storage: PreferenceStorage,
    readonly diagnostics: Diagnostics,
  ) {
    const { preferences, warning } = storage.load();
    this.snapshot = {
      preferences,
      session: session.getSnapshot(),
      requestedPower: 'unknown',
      message: 'Connect when ready. Your selection is saved here.',
      storageWarning: warning,
    };
    session.subscribe(() => {
      const sessionState = session.getSnapshot();
      this.patch({
        session: sessionState,
        message:
          sessionState.state === 'connected' && this.snapshot.session.state !== 'connected'
            ? this.snapshot.requestedPower === 'off'
              ? 'Ready for next On. Colour changes are held.'
              : 'Adjust a control or tap On to use this setting.'
            : this.snapshot.message,
      });
    });
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.snapshot;
  private patch(patch: Partial<ControllerSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  private persist(preferences: Preferences) {
    this.patch({ preferences, storageWarning: this.storage.save(preferences) });
  }
  notify(message: string) {
    this.patch({ message });
  }
  select(settings: Settings, commit = true) {
    try {
      const selected = validateSettings(settings);
      const previous = this.snapshot.preferences.selected;
      if (
        (commit && this.snapshot.storageWarning) ||
        selected.brightness !== previous.brightness ||
        selected.rgb.some((value, index) => value !== previous.rgb[index])
      )
        this.persist({ ...this.snapshot.preferences, selected });
      if (!commit) return;
      if (this.snapshot.requestedPower === 'off')
        this.notify('Ready for next On. Colour changes are held.');
      else if (this.snapshot.session.state !== 'connected')
        this.notify('Connect when ready. Your selection is saved here.');
      else void this.send({ kind: 'colour', settings: selected });
    } catch (error) {
      this.notify((error as Error).message);
    }
  }
  commit() {
    this.select(this.snapshot.preferences.selected);
  }
  power(power: 'on' | 'off') {
    if (this.snapshot.session.state !== 'connected') {
      this.notify('Connect before sending a power command.');
      return;
    }
    this.patch({ requestedPower: power });
    void this.send(
      power === 'off'
        ? { kind: 'off' }
        : { kind: 'on', settings: this.snapshot.preferences.selected },
    );
  }
  private async send(command: Command) {
    const id = ++this.feedbackId;
    this.notify('Sending…');
    const outcome = await this.session.submit(command);
    if (outcome.status === 'submitted' && command.kind !== 'off')
      this.patch({ lastSubmitted: command.settings });
    if (id !== this.feedbackId) return;
    if (outcome.status === 'submitted')
      this.notify(
        command.kind === 'off'
          ? 'Off command sent. Edits prepare your next On.'
          : command.kind === 'on'
            ? 'On command sent.'
            : 'Colour and brightness sent.',
      );
    else if (outcome.status === 'uncertain')
      this.notify(
        'The last command may have reached the strip. Check the lights before sending again.',
      );
    else if (outcome.status === 'failed')
      this.notify(outcome.message || 'Could not send the command.');
    else this.notify('Pending command cancelled. Your selection is still saved here.');
  }
  saveFavourite(name: string, id?: string) {
    try {
      const favourites = this.snapshot.preferences.favourites;
      if (!id && favourites.length >= 30)
        throw new Error('You have 30 favourites. Delete one to make space.');
      const favourite: Favourite = {
        id: id || crypto.randomUUID(),
        name: favouriteName(name),
        settings: validateSettings(this.snapshot.preferences.selected),
      };
      this.persist({
        ...this.snapshot.preferences,
        favourites: id
          ? favourites.map((f) => (f.id === id ? favourite : f))
          : [...favourites, favourite],
      });
      this.notify(`${favourite.name} saved on this device.`);
      return true;
    } catch (error) {
      this.notify((error as Error).message);
      return false;
    }
  }
  renameFavourite(id: string, name: string) {
    try {
      const checked = favouriteName(name);
      this.persist({
        ...this.snapshot.preferences,
        favourites: this.snapshot.preferences.favourites.map((f) =>
          f.id === id ? { ...f, name: checked } : f,
        ),
      });
      this.notify('Favourite renamed.');
      return true;
    } catch (error) {
      this.notify((error as Error).message);
      return false;
    }
  }
  deleteFavourite(id: string) {
    this.persist({
      ...this.snapshot.preferences,
      favourites: this.snapshot.preferences.favourites.filter((f) => f.id !== id),
    });
    this.notify('Favourite deleted.');
  }
}
