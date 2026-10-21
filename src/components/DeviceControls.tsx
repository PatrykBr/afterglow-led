import type { LightingController, ControllerSnapshot } from '../controller';
import { Icon } from './Icon';

export function DeviceHeader({ app, state, onDetails }: { app: LightingController; state: ControllerSnapshot; onDetails: () => void }) {
  const { session } = state;
  const label = { disconnected: 'Not connected', connecting: 'Connecting…', connected: 'Connected', disconnecting: 'Disconnecting…' }[session.state];
  return <header className="app-header">
    <div><h1>afterglow<span>.</span></h1><button className={`device-status ${session.state}`} onClick={onDetails} aria-label={`Device details, ${label}`}><span className="status-dot" />{label}<Icon name="chevron" size={13} /></button></div>
    {session.state === 'disconnected' ? <button className="primary-button connect-button" onClick={() => void app.session.connect()}><Icon name="bluetooth" size={17} />{session.hasDevice ? 'Reconnect' : 'Connect'}</button>
      : session.state === 'connecting' ? <button className="secondary-button" onClick={() => void app.session.disconnect()}>Cancel</button>
      : <button className="device-button" aria-label="Open connection controls" onClick={onDetails}><Icon name="bluetooth" size={21} /></button>}
  </header>;
}

export function PowerControls({ app, state }: { app: LightingController; state: ControllerSnapshot }) {
  const connected = state.session.state === 'connected';
  return <section className="power-controls" aria-label="Power and apply controls">
    <div className="power-buttons"><button disabled={!connected} className={state.requestedPower === 'on' ? 'requested' : ''} aria-label="Turn on" onClick={() => app.power('on')}><Icon name="power" size={18} />On</button><button disabled={!connected} className={state.requestedPower === 'off' ? 'requested' : ''} aria-label="Turn off" onClick={() => app.power('off')}><Icon name="moon" size={18} />Off</button></div>
    <button className="apply-button" disabled={!connected} onClick={() => app.apply()}>{state.requestedPower === 'off' ? 'On & apply' : 'Apply'}<Icon name="arrow" size={16} /></button>
  </section>;
}

export function DeviceDetails({ app, state, onDone }: { app: LightingController; state: ControllerSnapshot; onDone: () => void }) {
  const { session } = state;
  const connected = session.state === 'connected';
  return <div className="device-details">
    <div className="device-identity"><span className="device-icon"><Icon name="bluetooth" size={28} /></span><div><strong>{session.deviceName || 'BJ_LED_M'}</strong><p>Your Bluetooth LED strip</p></div></div>
    <p className="sheet-description">{connected ? 'Connected for this page session. The strip does not report its current power or colour.' : session.state === 'disconnecting' ? 'Waiting for the last write to settle before releasing the connection.' : 'Keep the strip powered and nearby. Connecting leaves the lights unchanged.'}</p>
    <dl className="device-facts"><div><dt>Connection</dt><dd>{session.state}</dd></div><div><dt>Last power request</dt><dd>{state.requestedPower === 'unknown' ? 'None this visit' : state.requestedPower === 'on' ? 'On' : 'Off'}</dd></div></dl>
    {session.error && <p role="alert" className="error">{session.error}</p>}
    {session.state === 'disconnected' ? <button className="primary-button full-width" onClick={() => { onDone(); void app.session.connect(); }}>{session.hasDevice ? 'Reconnect' : 'Connect'}</button> : <button className="secondary-button full-width" disabled={session.state === 'disconnecting'} onClick={() => void app.session.disconnect()}>{session.state === 'connecting' ? 'Cancel connection' : session.state === 'disconnecting' ? 'Finishing disconnect…' : 'Disconnect'}</button>}
    {session.hasDevice && session.state === 'disconnected' && <button className="text-button full-width" onClick={() => { onDone(); void app.session.connect(true); }}>Choose a device again</button>}
    <p className="fine-print">For a normal disconnect, keep this page open until the status changes to Not connected. A reload may require device selection again.</p>
  </div>;
}
