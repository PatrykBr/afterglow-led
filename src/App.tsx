import { useState, useSyncExternalStore } from 'react';
import { controller } from './app-service';
import { hex, rgbToHsv } from './domain/lighting';
import { Connection, Power } from './components/Connection';
import { ColourDial, ExactColour, LightSliders, Presets } from './components/ColourControls';
import { Favourites } from './components/Favourites';
import { Icon } from './components/Icon';

export default function App() {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const { selected, favourites } = state.preferences;
  const [rememberedHue, setRememberedHue] = useState(0);
  const [rgbHue, saturation] = rgbToHsv(selected.rgb);
  const hue = saturation === 0 ? rememberedHue : rgbHue;
  const [diagnosticText, setDiagnosticText] = useState('');
  const [copied, setCopied] = useState(false);
  const connected = state.session.state === 'connected';
  async function copyDiagnostics() {
    const data = controller.diagnostics.export();
    setDiagnosticText(data);
    try { await navigator.clipboard.writeText(data); setCopied(true); }
    catch { setCopied(false); }
  }
  return <div className="app-shell">
    <header className="app-header"><a href="#main" className="brand" aria-label="Afterglow home"><span className="brand-mark"><span /></span>afterglow<span className="brand-stop">.</span></a><span className="header-note">A little light, just for you.</span></header>
    <main id="main">
      <Connection app={controller} state={state} />
      <Power app={controller} state={state} />
      {state.storageWarning && <p role="alert" className="storage-warning">{state.storageWarning}</p>}
      <div className="control-panel">
        <ColourDial app={controller} settings={selected} hue={hue} onHueChange={setRememberedHue} />
        <div className="control-side"><LightSliders app={controller} settings={selected} hue={hue} onHueChange={setRememberedHue} /><Presets app={controller} settings={selected} /></div>
      </div>
      <ExactColour key={hex(selected.rgb)} app={controller} settings={selected} />
      <Favourites app={controller} favourites={favourites} />
      <details className="help"><summary>Using Afterglow on your iPhone</summary><div className="help-content"><p>Open this page in Bluefy, with Bluetooth enabled. Keep your strip powered and nearby. Tap Connect and choose BJ_LED_M. Connecting leaves the lights unchanged.</p><p>Tap Apply selection to send your saved colour. After that, colour controls send on release. After Turn off, edits prepare your next On setting. Tap Turn on to send it.</p><p>Bookmark this page using Bluefy's bookmark menu. A reload or new session may require you to select the device again. Reconnect reuses the selected device when available and never replays a lighting command.</p><p>Keep this page open for control. When disconnecting, wait for "Not connected" before closing the page. Backgrounding or closing the browser can interrupt a Bluetooth session.</p><p>The On and Off packets still need confirmation on your physical strip. Commands are sent without a device acknowledgement, so check the light itself.</p><a href="https://bluefy.app/guide.html" target="_blank" rel="noreferrer">Bluefy connection guide</a></div></details>
      <details className="help diagnostics"><summary>Diagnostics &amp; troubleshooting</summary><div className="help-content"><p>If connection fails, check Bluefy's Bluetooth permission in iPhone Settings, move closer to the powered strip and close BojiaLed or other connected controllers.</p><p>No device state is read. After a timeout, check the strip, reconnect, then send the setting you want. There are no automatic write retries.</p><p>Verified channel: EEA0 / EE01. Write spacing: 80 ms. Normal disconnect hold: 3 seconds.</p>{state.lastSubmitted && <p>Last submitted selection: {hex(state.lastSubmitted.rgb)} at {state.lastSubmitted.brightness}%.</p>}<button className="quiet-button" onClick={() => void copyDiagnostics()}>{copied ? 'Diagnostics copied' : 'Copy diagnostics'}</button>{diagnosticText && <label className="diagnostic-export">{copied ? 'Exported history' : 'Copy this history manually'}<textarea readOnly value={diagnosticText} rows={8} onFocus={event => event.target.select()} /></label>}</div></details>
      <footer className="page-footer"><span>Made for your corner of the world.</span><span>Afterglow v1.0.1</span></footer>
    </main>
    <aside className="apply-bar" aria-label="Apply selected lighting">
      <div className="apply-content"><div className="feedback"><span className={`status-dot ${connected ? 'live' : ''}`} /><p role="status" aria-live="polite">{state.session.pending ? `Sending commands (${state.session.pending})…` : state.message}</p></div><button className="apply-button" disabled={!connected} onClick={() => controller.apply()}><span>{state.requestedPower === 'off' ? 'Turn on & apply' : 'Apply selection'}</span><Icon name="arrow" size={20} /></button></div>
    </aside>
  </div>;
}
