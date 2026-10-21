import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { hex, fromHex, hsvToRgb, PRESETS, rgbToHsv, type RGB, type Settings } from '../domain/lighting';
import type { LightingController } from '../controller';
import { Icon } from './Icon';

type HueControls = { app: LightingController; settings: Settings; hue: number; onHueChange: (hue: number) => void };
export function ColourDial({ app, settings, hue, onHueChange }: HueControls) {
  const [, saturation] = rgbToHsv(settings.rgb);
  const displayHue = hue;
  const colour = hex(settings.rgb);
  const updateHue = (h: number, commit: boolean) => {
    onHueChange(h);
    app.select({ ...app.getSnapshot().preferences.selected, rgb: hsvToRgb(h, saturation) }, commit);
  };
  const pointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(x, y) < 30) return;
    updateHue((Math.atan2(x, -y) * 180 / Math.PI + 360) % 360, false);
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const amount = event.shiftKey ? 10 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 359 : ['ArrowRight', 'ArrowUp'].includes(event.key) ? (displayHue + amount) % 360 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? (displayHue - amount + 360) % 360 : undefined;
    if (next !== undefined) { event.preventDefault(); updateHue(next, true); }
  };
  return <section className="dial-section" aria-labelledby="colour-heading">
    <div className="section-heading"><h2 id="colour-heading">Find your colour</h2><span>Selected preview</span></div>
    <div className="colour-dial" style={{ '--light': colour, '--rotation': `${displayHue}deg` } as CSSProperties}
      role="slider" aria-label="Colour hue" aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(displayHue) % 360} aria-valuetext={`${Math.round(displayHue) % 360} degrees, ${colour}`} tabIndex={0} onKeyDown={key}
      onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); pointer(event); }}
      onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pointer(event); }}
      onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) { pointer(event); event.currentTarget.releasePointerCapture(event.pointerId); app.commit(); } }}
      onPointerCancel={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
      <div className="dial-core"><div className="light-orb" /><span>Your selection</span><strong>{colour}</strong><small>{settings.brightness}% brightness</small></div>
      <span className="dial-position"><span /></span>
    </div>
    <p className="dial-help">Slide around the ring. Make the light your own.</p>
  </section>;
}

function CommittedRange({ id, label, value, min = 0, max = 100, onDraft, onCommit, style }: { id: string; label: string; value: number; min?: number; max?: number; onDraft: (value: number) => void; onCommit: () => void; style?: CSSProperties }) {
  const dirty = useRef(false);
  const commit = () => { if (dirty.current) { dirty.current = false; onCommit(); } };
  return <input id={id} aria-label={label} type="range" min={min} max={max} value={value} style={style}
    onChange={event => { dirty.current = true; onDraft(Number(event.target.value)); }}
    onPointerUp={commit} onKeyUp={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) commit(); }}
    onBlur={commit} />;
}

export function LightSliders({ app, settings, hue, onHueChange }: HueControls) {
  const [, saturation] = rgbToHsv(settings.rgb);
  return <div className="light-sliders">
    <section className="slider-section" aria-labelledby="saturation-heading">
      <div className="section-heading"><h2 id="saturation-heading"><label htmlFor="saturation">Saturation</label></h2><output htmlFor="saturation">{Math.round(saturation * 100)}<small>%</small></output></div>
      <CommittedRange id="saturation" label="Saturation" value={Math.round(saturation * 100)} onDraft={value => { onHueChange(hue); app.select({ ...settings, rgb: hsvToRgb(hue, value / 100) }, false); }} onCommit={() => app.commit()} style={{ '--track': `linear-gradient(to right, #fff, ${hex(hsvToRgb(hue, 1))})` } as CSSProperties} />
      <div className="range-captions"><span>Soft</span><span>Rich</span></div>
    </section>
    <section className="slider-section" aria-labelledby="brightness-heading">
      <div className="section-heading"><h2 id="brightness-heading"><label htmlFor="brightness"><Icon name="sun" size={19} />Brightness</label></h2><output htmlFor="brightness">{settings.brightness}<small>%</small></output></div>
      <CommittedRange id="brightness" label="Brightness" min={1} value={settings.brightness} onDraft={value => app.select({ ...settings, brightness: value }, false)} onCommit={() => app.commit()} style={{ '--track': 'linear-gradient(to right, #45526d, #eee7ff)' } as CSSProperties} />
      <div className="quick-levels" aria-label="Quick brightness levels">{[10, 25, 50, 75, 100].map(level => <button key={level} aria-pressed={settings.brightness === level} onClick={() => app.select({ ...settings, brightness: level })}>{level}%</button>)}</div>
    </section>
  </div>;
}

export function Presets({ app, settings }: { app: LightingController; settings: Settings }) {
  return <section className="presets" aria-labelledby="presets-heading"><div className="section-heading"><h2 id="presets-heading">A little inspiration</h2><span>Colour presets</span></div><div className="preset-grid">{PRESETS.map(preset => {
    const active = hex(preset.rgb) === hex(settings.rgb);
    return <button key={preset.name} className="preset" aria-pressed={active} onClick={() => app.select({ ...settings, rgb: preset.rgb })}><span className="preset-swatch" style={{ backgroundColor: hex(preset.rgb) }}>{active && <Icon name="check" size={19} />}</span><span>{preset.name}</span></button>;
  })}</div></section>;
}

export function ExactColour({ app, settings }: { app: LightingController; settings: Settings }) {
  const [colour, setColour] = useState(hex(settings.rgb));
  const [rgb, setRgb] = useState<string[]>(settings.rgb.map(String));
  const [error, setError] = useState('');
  return <details className="exact-colour"><summary>Set an exact colour</summary><div className="exact-forms">
    <form onSubmit={event => { event.preventDefault(); try { app.select({ ...settings, rgb: fromHex(colour) }); setError(''); } catch (error) { setError((error as Error).message); } }}>
      <label htmlFor="hex-colour">Hex colour</label><div className="input-action"><input id="hex-colour" value={colour} maxLength={7} spellCheck={false} autoCapitalize="characters" onChange={event => setColour(event.target.value)} /><button type="submit">Use hex</button></div>
    </form>
    <form onSubmit={event => { event.preventDefault(); try { const value = { ...settings, rgb: rgb.map(Number) as unknown as RGB }; if (rgb.some(v => !v.trim())) throw new Error('Enter all three RGB channels.'); app.select(value); setError(''); } catch (error) { setError((error as Error).message); } }}>
      <div className="rgb-fields">{['Red', 'Green', 'Blue'].map((label, i) => <label key={label}>{label}<input aria-label={`${label} channel`} type="number" min={0} max={255} step={1} required value={rgb[i]} onChange={event => setRgb(rgb.map((v, j) => i === j ? event.target.value : v))} /></label>)}</div><button className="quiet-button" type="submit">Use RGB</button>
    </form>
    {error && <p role="alert" className="error">{error}</p>}
  </div></details>;
}
