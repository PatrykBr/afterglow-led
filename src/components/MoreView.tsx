import { useState } from 'react';
import type { LightingController, ControllerSnapshot } from '../controller';
import { hex } from '../domain/lighting';
import { Icon } from './Icon';

export function MoreView({
  app,
  state,
  onDevice,
}: {
  app: LightingController;
  state: ControllerSnapshot;
  onDevice: () => void;
}) {
  const [history, setHistory] = useState('');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const data = app.diagnostics.export();
    setHistory(data);
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section className="more-view" aria-label="Help and troubleshooting">
      <button className="settings-row" onClick={onDevice}>
        <span className="row-icon">
          <Icon name="bluetooth" />
        </span>
        <span>
          <strong>Your strip</strong>
          <small>{state.session.deviceName || 'BJ_LED_M'}</small>
        </span>
        <Icon name="chevron" size={17} />
      </button>
      <details className="help">
        <summary>Using Afterglow in Bluefy</summary>
        <div className="help-content">
          <p>
            Tap Connect and choose BJ_LED_M. Connecting leaves the light unchanged. Adjust a control
            or tap On to send the selected colour and brightness.
          </p>
          <p>
            Controls send on release while connected. After Off, edits wait until you tap On. The
            power highlight shows your last request. The strip does not report its power state.
          </p>
          <p>
            Bookmark this page in Bluefy. Reloading may require choosing the device again. Reconnect
            reuses the selected device when possible and sends no lighting commands.
          </p>
          <p>
            Keep Bluefy open while controlling the strip. To disconnect, open Your strip and wait
            for Not connected before leaving. Switching apps or locking the phone may interrupt
            Bluetooth.
          </p>
          <a href="https://bluefy.app/guide.html" target="_blank" rel="noreferrer">
            Bluefy connection guide
          </a>
        </div>
      </details>
      <details className="help">
        <summary>Connection problems</summary>
        <div className="help-content">
          <p>
            Enable Bluetooth and allow Bluefy to use it in iPhone Settings. Keep the strip powered
            and nearby. Close BojiaLed or other apps connected to it.
          </p>
          <p>
            After a timeout, a command may have reached the strip. Check the light before
            reconnecting and sending again. Commands are never retried automatically.
          </p>
          <p>Open the HTTPS site in Bluefy. Safari may not provide Bluetooth access.</p>
        </div>
      </details>
      <details className="help diagnostics">
        <summary>Diagnostics &amp; protocol notes</summary>
        <div className="help-content">
          <p>
            The app writes to EEA0 / EE01 and waits at least 80 ms between commands. Disconnecting
            keeps the connection open for 3 seconds after the last command.
          </p>
          <p>The strip does not confirm command delivery. Check the light after sending.</p>
          {state.lastSubmitted && (
            <p>
              Last colour sent: {hex(state.lastSubmitted.rgb)} at {state.lastSubmitted.brightness}%.
            </p>
          )}
          <button className="secondary-button" onClick={() => void copy()}>
            {copied ? 'Copied' : 'Copy diagnostics'}
          </button>
          {history && (
            <label className="diagnostic-export">
              {copied ? 'Diagnostics' : 'Select and copy the text'}
              <textarea
                readOnly
                value={history}
                rows={7}
                onFocus={(event) => event.target.select()}
              />
            </label>
          )}
        </div>
      </details>
      <p className="about">
        Afterglow <span>Version 1.5.1</span>
      </p>
      <p className="fine-print">Settings and saved lights stay in this browser.</p>
    </section>
  );
}
