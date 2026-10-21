import { BluetoothSession } from './bluetooth/session';
import { LightingController } from './controller';
import { Diagnostics } from './diagnostics';
import { PreferenceStorage } from './persistence/preferences';

const diagnostics = new Diagnostics();
const session = new BluetoothSession(() => window.isSecureContext ? navigator.bluetooth : undefined, diagnostics);
export const controller = new LightingController(session, new PreferenceStorage(() => window.localStorage), diagnostics);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    session.resume();
    if (session.getSnapshot().state === 'connected') controller.notify('Page active again. The strip does not report its state. Apply your selection if needed.');
  }
});
window.addEventListener('pagehide', () => { void session.disconnect(); });
// A module replacement releases the old singleton; rendering never owns Bluetooth.
if (import.meta.hot) import.meta.hot.dispose(() => { void session.disconnect(); });
