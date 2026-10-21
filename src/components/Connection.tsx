import type { LightingController, ControllerSnapshot } from '../controller';
import { Icon } from './Icon';

export function Connection({ app, state }: { app: LightingController; state: ControllerSnapshot }) {
  const { session } = state;
  const connected = session.state === 'connected';
  const label = { disconnected: 'Not connected', connecting: 'Connecting…', connected: session.deviceName || 'BJ_LED_M', disconnecting: 'Finishing disconnect…' }[session.state];
  return <section className="connection" aria-label="Bluetooth connection">
    <div className="connection-main">
      <span className={`connection-icon ${connected ? 'is-connected' : ''}`}><Icon name="bluetooth" /></span>
      <div className="connection-description"><strong>{label}</strong><span>{connected ? 'Connected for this page session' : session.state === 'disconnecting' ? 'Giving the last write time to settle' : session.state === 'connecting' ? 'Choose BJ_LED_M, then keep it nearby' : 'Your Bluetooth LED strip'}</span></div>
      {session.state === 'disconnected'
        ? <button className="connect-button" onClick={() => void app.session.connect()}>{session.hasDevice ? 'Reconnect' : 'Connect'}</button>
        : <button className="quiet-button" disabled={session.state === 'disconnecting'} onClick={() => void app.session.disconnect()}>{session.state === 'connecting' ? 'Cancel' : 'Disconnect'}</button>}
    </div>
    {session.error && <p className="error" role="alert">{session.error}</p>}
    {session.state === 'disconnected' && session.hasDevice && <button className="text-button choose-device" onClick={() => void app.session.connect(true)}>Choose a device again</button>}
  </section>;
}

export function Power({ app, state }: { app: LightingController; state: ControllerSnapshot }) {
  return <section className="power-row" aria-label="Power controls">
    <div><h2>Make room for a mood.</h2><p>{state.requestedPower === 'unknown' ? 'The strip does not report its power state.' : `Last requested: ${state.requestedPower === 'on' ? 'On' : 'Off'}. Check the strip to confirm.`}</p></div>
    <div className="power-buttons">
      <button className={state.requestedPower === 'on' ? 'selected' : ''} disabled={state.session.state !== 'connected'} onClick={() => app.power('on')}><Icon name="power" size={18} />Turn on</button>
      <button className={state.requestedPower === 'off' ? 'selected' : ''} disabled={state.session.state !== 'connected'} onClick={() => app.power('off')}><Icon name="moon" size={18} />Turn off</button>
    </div>
  </section>;
}
