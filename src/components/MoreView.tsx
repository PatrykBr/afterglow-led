import { useState } from 'react';
import type { LightingController, ControllerSnapshot } from '../controller';
import { hex } from '../domain/lighting';
import { Icon } from './Icon';

export function MoreView({ app, state, onDevice }: { app: LightingController; state: ControllerSnapshot; onDevice: () => void }) {
  const [history, setHistory] = useState('');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const data = app.diagnostics.export(); setHistory(data);
    try { await navigator.clipboard.writeText(data); setCopied(true); } catch { setCopied(false); }
  };
  return <section className="more-view" aria-label="Help and troubleshooting">
    <button className="settings-row" onClick={onDevice}><span className="row-icon"><Icon name="bluetooth" /></span><span><strong>Your strip</strong><small>{state.session.deviceName || 'BJ_LED_M'}</small></span><Icon name="chevron" size={17} /></button>
    <details className="help"><summary>Using Afterglow in Bluefy</summary><div className="help-content"><p>Tap Connect and select BJ_LED_M. Connection leaves the light unchanged. Adjust colour or brightness to send a change, or tap On to use the prepared colour and brightness.</p><p>Colour and brightness changes send on release while connected. After Off, edits prepare the next On setting. The highlighted power action is your last request, not a reading from the strip.</p><p>Bookmark this URL in Bluefy. A reload may require selection again. Reconnect reuses the selected device where possible and never replays commands.</p><p>Keep Bluefy open while controlling the strip. Use Your strip to disconnect and wait for Not connected before leaving. Backgrounding or locking iPhone may interrupt Bluetooth.</p><a href="https://bluefy.app/guide.html" target="_blank" rel="noreferrer">Bluefy connection guide</a></div></details>
    <details className="help"><summary>Connection problems</summary><div className="help-content"><p>Check Bluetooth is enabled and Bluefy has permission in iPhone Settings. Keep the strip powered and nearby. Close BojiaLed or other connected controllers.</p><p>After a timeout, a command may have reached the strip. Check the light, reconnect, then apply explicitly. Nothing is retried automatically.</p><p>Open the HTTPS URL in Bluefy. Safari and untested home-screen launches may not provide Bluetooth access.</p></div></details>
    <details className="help diagnostics"><summary>Diagnostics &amp; protocol notes</summary><div className="help-content"><p>Verified channel: EEA0 / EE01. Write spacing: 80 ms. Normal disconnect hold: 3 seconds. No device state is read.</p><p>On and Off packets came from the Android app and still need physical confirmation. Without-response writes are submissions, not device acknowledgements.</p>{state.lastSubmitted && <p>Last submitted: {hex(state.lastSubmitted.rgb)} at {state.lastSubmitted.brightness}%.</p>}<button className="secondary-button" onClick={() => void copy()}>{copied ? 'Copied' : 'Copy diagnostics'}</button>{history && <label className="diagnostic-export">{copied ? 'Exported history' : 'Select and copy this history'}<textarea readOnly value={history} rows={7} onFocus={event => event.target.select()} /></label>}</div></details>
    <p className="about">Afterglow <span>Version 1.4.0</span></p><p className="fine-print">Settings stay in this browser. No account, cloud control or background schedules.</p>
  </section>;
}
