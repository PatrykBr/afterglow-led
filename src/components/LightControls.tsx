import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { LightingController } from '../controller';
import { hex, fromHex, hsvToRgb, rgbToHsv, validateSettings, PRESETS, type Settings, type RGB } from '../domain/lighting';
import { Icon } from './Icon';

type ColourProps = { app: LightingController; settings: Settings; hue: number; onHueChange: (value: number) => void };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function ColourPad({ app, settings, hue, onHueChange }: ColourProps) {
  const [, saturation] = rgbToHsv(settings.rgb);
  const dirty = useRef(false);
  const draft = (h: number, s: number) => {
    dirty.current = true;
    onHueChange(h);
    app.select({ ...app.getSnapshot().preferences.selected, rgb: hsvToRgb(h, s) }, false);
  };
  const commit = () => { if (dirty.current) { dirty.current = false; app.commit(); } };
  const pointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    draft(clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * 359, 1 - clamp((event.clientY - bounds.top) / bounds.height, 0, 1));
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const h = event.key === 'Home' ? 0 : event.key === 'End' ? 359 : event.key === 'ArrowLeft' ? (hue - step + 360) % 360 : event.key === 'ArrowRight' ? (hue + step) % 360 : hue;
    const s = event.key === 'ArrowUp' ? clamp(saturation + step / 100, 0, 1) : event.key === 'ArrowDown' ? clamp(saturation - step / 100, 0, 1) : saturation;
    draft(h, s);
  };
  return <>
    <div className="colour-pad" role="slider" aria-label="Colour picker" tabIndex={0} aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(hue) % 360}
      aria-valuetext={`${hex(settings.rgb)}, hue ${Math.round(hue)} degrees, saturation ${Math.round(saturation * 100)} percent`}
      aria-describedby="colour-instructions" style={{ '--x': `${hue / 359 * 100}%`, '--y': `${(1 - saturation) * 100}%`, '--light': hex(settings.rgb) } as CSSProperties}
      onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); pointer(event); }}
      onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pointer(event); }}
      onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) { pointer(event); event.currentTarget.releasePointerCapture(event.pointerId); commit(); } }}
      onPointerCancel={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); dirty.current = false; app.notify('Selection saved. Adjust a control or tap On to use it.'); }}
      onKeyDown={keyboard} onKeyUp={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) commit(); }} onBlur={commit}>
      <span className="colour-cursor" />
    </div>
    <p className="pad-hint" id="colour-instructions">Drag to choose. Softer colours at the bottom.<span className="sr-only"> Use left and right arrow keys for hue, up and down for saturation. Exact colour opens labelled sliders.</span></p>
  </>;
}

function Range({ id, label, value, min = 0, max = 100, onDraft, onCommit, style }: { id: string; label: string; value: number; min?: number; max?: number; onDraft: (value: number) => void; onCommit: () => void; style?: CSSProperties }) {
  const dirty = useRef(false);
  const commit = () => { if (dirty.current) { dirty.current = false; onCommit(); } };
  return <input id={id} type="range" aria-label={label} min={min} max={max} value={value} style={style}
    onChange={event => { dirty.current = true; onDraft(Number(event.target.value)); }}
    onPointerUp={commit} onBlur={commit}
    onKeyUp={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) commit(); }} />;
}

export function Brightness({ app, settings }: { app: LightingController; settings: Settings }) {
  return <section className="brightness-section" aria-labelledby="brightness-title">
    <div className="section-heading"><h2 id="brightness-title"><label htmlFor="brightness"><Icon name="sun" size={19} />Brightness</label></h2><output htmlFor="brightness">{settings.brightness}<span>%</span></output></div>
    <Range id="brightness" label="Brightness" min={1} value={settings.brightness} onDraft={brightness => app.select({ ...settings, brightness }, false)} onCommit={() => app.commit()} style={{ '--fill': `${settings.brightness}%` } as CSSProperties} />
    <div className="quick-levels" aria-label="Quick brightness levels">{[10, 25, 50, 100].map(level => <button key={level} aria-pressed={settings.brightness === level} onClick={() => app.select({ ...settings, brightness: level })}>{level}%</button>)}</div>
  </section>;
}

export function Presets({ app, settings, onSave, onSaved }: { app: LightingController; settings: Settings; onSave: () => void; onSaved: () => void }) {
  return <section className="presets" aria-labelledby="presets-title">
    <div className="section-heading"><h2 id="presets-title">Presets</h2><div className="preset-actions"><button className="icon-button glass-button" aria-label="Saved lights" onClick={onSaved}><Icon name="saved" size={19} /></button><button className="icon-button glass-button" aria-label="Save this light" onClick={onSave}><Icon name="plus" size={20} /></button></div></div>
    <div className="preset-grid">{PRESETS.map(preset => <button key={preset.name} className="preset" aria-pressed={hex(preset.rgb) === hex(settings.rgb)} onClick={() => app.select({ ...settings, rgb: preset.rgb })}>
      <span style={{ background: hex(preset.rgb) }}>{hex(preset.rgb) === hex(settings.rgb) && <Icon name="check" size={18} />}</span><span>{preset.name === 'Soft white' ? 'Warm' : preset.name}</span>
    </button>)}</div>
  </section>;
}

export function ExactColour({ app, settings, hue, onHueChange, onDone }: ColourProps & { onDone: () => void }) {
  const [colour, setColour] = useState(hex(settings.rgb));
  const [rgb, setRgb] = useState(settings.rgb.map(String));
  const [error, setError] = useState('');
  const [, saturation] = rgbToHsv(settings.rgb);
  const draftExact = (rgb: RGB) => {
    setColour(hex(rgb)); setRgb(rgb.map(String)); setError('');
    app.select({ ...app.getSnapshot().preferences.selected, rgb }, false);
  };
  const apply = (value: RGB) => {
    const selected = validateSettings({ ...app.getSnapshot().preferences.selected, rgb: value });
    app.select(selected); onDone();
  };
  return <div className="exact-colour">
    <p className="sheet-description">Fine-tune your selection. Changes send on release while connected, unless Off was requested.</p>
    <div className="precision-slider"><div className="section-heading"><label htmlFor="hue">Hue</label><output htmlFor="hue">{Math.round(hue)}°</output></div>
      <Range id="hue" label="Hue" max={359} value={Math.round(hue)} onDraft={value => { onHueChange(value); draftExact(hsvToRgb(value, saturation)); }} onCommit={() => app.commit()} style={{ '--track': 'linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)' } as CSSProperties} /></div>
    <div className="precision-slider"><div className="section-heading"><label htmlFor="saturation">Saturation</label><output htmlFor="saturation">{Math.round(saturation * 100)}%</output></div>
      <Range id="saturation" label="Saturation" value={Math.round(saturation * 100)} onDraft={value => { onHueChange(hue); draftExact(hsvToRgb(hue, value / 100)); }} onCommit={() => app.commit()} style={{ '--track': `linear-gradient(to right,#fff,${hex(hsvToRgb(hue, 1))})` } as CSSProperties} /></div>
    <form onSubmit={event => { event.preventDefault(); try { apply(fromHex(colour)); } catch (error) { setError((error as Error).message); } }}>
      <label htmlFor="hex-colour">Hex colour</label><div className="input-action"><input id="hex-colour" value={colour} maxLength={7} spellCheck={false} autoCapitalize="characters" onChange={event => setColour(event.target.value)} /><button type="submit" className="secondary-button">Use hex</button></div>
    </form>
    <form onSubmit={event => { event.preventDefault(); try { if (rgb.some(v => !v.trim())) throw new Error('Enter all three colour channels.'); apply(rgb.map(Number) as unknown as RGB); } catch (error) { setError((error as Error).message); } }}>
      <div className="rgb-fields">{['Red', 'Green', 'Blue'].map((label, i) => <label key={label}>{label}<input aria-label={`${label} channel`} type="number" min={0} max={255} step={1} required value={rgb[i]} onChange={event => setRgb(rgb.map((v, j) => i === j ? event.target.value : v))} /></label>)}</div><button type="submit" className="secondary-button full-width">Use RGB</button>
    </form>
    {error && <p role="alert" className="error">{error}</p>}
  </div>;
}
