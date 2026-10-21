import { useId, type CSSProperties } from 'react';
import type { LightingController } from '../controller';
import type { Settings } from '../domain/lighting';
import { dimmerSelection } from '../domain/control-geometry';
import { useDirectControl } from './use-direct-control';
import { Icon } from './Icon';

const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
export function DimmerControl({ app, settings }: { app: LightingController; settings: Settings }) {
  const instructions = useId();
  const draft = (brightness: number) => app.select({ ...app.getSnapshot().preferences.selected, brightness }, false);
  const control = useDirectControl((_x, y, bounds) => draft(dimmerSelection(y, bounds.height)), () => app.commit(), () => app.notify('Brightness prepared. Adjust a control or tap On to send it.'));
  return <section className="large-dimmer" aria-labelledby="dimmer-title">
    <div className="section-heading"><h2 id="dimmer-title">Brightness</h2><output>{settings.brightness}%</output></div>
    <div className="dimmer-stage"><div className="dimmer-control" role="slider" aria-label="Brightness dimmer" aria-orientation="vertical" aria-valuemin={1} aria-valuemax={100} aria-valuenow={settings.brightness} aria-valuetext={`${settings.brightness} percent`} aria-describedby={instructions} tabIndex={0}
      style={{ '--brightness': `${settings.brightness}%` } as CSSProperties} {...control.pointerHandlers}
      onKeyDown={event => {
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const amount = event.key.startsWith('Page') || event.shiftKey ? 10 : 1;
        const value = event.key === 'Home' ? 1 : event.key === 'End' ? 100 : settings.brightness + (['ArrowUp', 'ArrowRight', 'PageUp'].includes(event.key) ? amount : -amount);
        control.markKeyboardDraft(); draft(Math.max(1, Math.min(100, value)));
      }} onKeyUp={event => { if (keys.includes(event.key)) control.commitKeyboard(); }}>
      <span className="dimmer-fill" /><span className="dimmer-handle" /><Icon name="sun" size={28} />
    </div></div>
    <p className="control-hint" id={instructions}>Slide up or down to dim.</p>
  </section>;
}
