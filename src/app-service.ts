import { BluetoothSession } from './bluetooth/session';
import { LightingController } from './controller';
import { Diagnostics } from './diagnostics';
import { PreferenceStorage } from './persistence/preferences';

const diagnostics = new Diagnostics();
const session = new BluetoothSession(
  () => (window.isSecureContext ? navigator.bluetooth : undefined),
  diagnostics,
);
export const controller = new LightingController(
  session,
  new PreferenceStorage(() => window.localStorage),
  diagnostics,
);

const visibilityChanged = () => {
  if (document.visibilityState === 'visible') {
    session.resume();
    if (session.getSnapshot().state === 'connected')
      controller.notify('Page active again. Adjust a control or tap On if needed.');
  }
};
const pageHidden = () => {
  void session.disconnect();
};
document.addEventListener('visibilitychange', visibilityChanged);
window.addEventListener('pagehide', pageHidden);
// A module replacement releases the old singleton; rendering never owns Bluetooth.
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    document.removeEventListener('visibilitychange', visibilityChanged);
    window.removeEventListener('pagehide', pageHidden);
    void session.disconnect();
  });
