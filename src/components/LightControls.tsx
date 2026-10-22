import { useRef, useState, type CSSProperties } from 'react';
import type { LightingController } from '../controller';
import {
  hex,
  fromHex,
  hsvToRgb,
  rgbToHsv,
  validateSettings,
  PRESETS,
  type Settings,
  type RGB,
} from '../domain/lighting';

type ColourProps = {
  app: LightingController;
  settings: Settings;
  hue: number;
  onHueChange: (value: number) => void;
};
function Range({
  id,
  label,
  value,
  min = 0,
  max = 100,
  onDraft,
  onCommit,
  style,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onDraft: (value: number) => void;
  onCommit: () => void;
  style?: CSSProperties;
}) {
  const dirty = useRef(false);
  const commit = () => {
    if (dirty.current) {
      dirty.current = false;
      onCommit();
    }
  };
  return (
    <input
      id={id}
      type="range"
      aria-label={label}
      min={min}
      max={max}
      value={value}
      style={style}
      onChange={(event) => {
        dirty.current = true;
        onDraft(Number(event.target.value));
      }}
      onPointerUp={commit}
      onPointerCancel={() => {
        dirty.current = false;
      }}
      onLostPointerCapture={() => {
        dirty.current = false;
      }}
      onBlur={commit}
      onKeyUp={(event) => {
        if (
          [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'PageUp',
            'PageDown',
          ].includes(event.key)
        )
          commit();
      }}
    />
  );
}

export function Brightness({ app, settings }: { app: LightingController; settings: Settings }) {
  return (
    <section className="brightness-section" aria-labelledby="brightness-title">
      <div className="section-heading">
        <h2 id="brightness-title">
          <label htmlFor="brightness">Brightness</label>
        </h2>
        <output htmlFor="brightness">
          {settings.brightness}
          <span>%</span>
        </output>
      </div>
      <Range
        id="brightness"
        label="Brightness"
        min={1}
        value={settings.brightness}
        onDraft={(brightness) => app.select({ ...settings, brightness }, false)}
        onCommit={() => app.commit()}
        style={{ '--fill': `${settings.brightness}%` } as CSSProperties}
      />
      <QuickLevels app={app} settings={settings} />
    </section>
  );
}

function QuickLevels({ app, settings }: { app: LightingController; settings: Settings }) {
  return (
    <div className="quick-levels" aria-label="Quick brightness levels">
      {[10, 25, 50, 100].map((level) => (
        <button
          key={level}
          aria-pressed={settings.brightness === level}
          onClick={() => app.select({ ...settings, brightness: level })}
        >
          {level}%
        </button>
      ))}
    </div>
  );
}

function Presets({ settings, onSelect }: { settings: Settings; onSelect: (rgb: RGB) => void }) {
  return (
    <section className="presets" aria-labelledby="presets-title">
      <div className="section-heading">
        <h2 id="presets-title">Quick colours</h2>
      </div>
      <div className="preset-grid">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            className="preset"
            aria-pressed={hex(preset.rgb) === hex(settings.rgb)}
            onClick={() => onSelect(preset.rgb)}
          >
            <span style={{ '--swatch': hex(preset.rgb) } as CSSProperties} />
            <span>{preset.name === 'Soft white' ? 'Warm' : preset.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ExactColour({
  app,
  settings,
  hue,
  onHueChange,
  onDone,
}: ColourProps & { onDone: () => void }) {
  const [colour, setColour] = useState(hex(settings.rgb));
  const [rgb, setRgb] = useState(settings.rgb.map(String));
  const [error, setError] = useState('');
  const [, saturation] = rgbToHsv(settings.rgb);
  const draftExact = (rgb: RGB) => {
    setColour(hex(rgb));
    setRgb(rgb.map(String));
    setError('');
    app.select({ ...app.getSnapshot().preferences.selected, rgb }, false);
  };
  const apply = (value: RGB) => {
    const selected = validateSettings({ ...app.getSnapshot().preferences.selected, rgb: value });
    app.select(selected);
    onDone();
  };
  return (
    <div className="exact-colour">
      <p className="sheet-description">
        Changes send on release while connected. After Off, tap On to send them.
      </p>
      <div className="precision-slider">
        <div className="section-heading">
          <label htmlFor="hue">Hue</label>
          <output htmlFor="hue">{Math.round(hue)}°</output>
        </div>
        <Range
          id="hue"
          label="Hue"
          max={359}
          value={Math.round(hue)}
          onDraft={(value) => {
            onHueChange(value);
            draftExact(hsvToRgb(value, saturation));
          }}
          onCommit={() => app.commit()}
          style={
            {
              '--track': 'linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)',
            } as CSSProperties
          }
        />
      </div>
      <div className="precision-slider">
        <div className="section-heading">
          <label htmlFor="saturation">Saturation</label>
          <output htmlFor="saturation">{Math.round(saturation * 100)}%</output>
        </div>
        <Range
          id="saturation"
          label="Saturation"
          value={Math.round(saturation * 100)}
          onDraft={(value) => {
            onHueChange(hue);
            draftExact(hsvToRgb(hue, value / 100));
          }}
          onCommit={() => app.commit()}
          style={
            {
              '--track': `linear-gradient(to right,#fff,${hex(hsvToRgb(hue, 1))})`,
            } as CSSProperties
          }
        />
      </div>
      <Presets
        settings={settings}
        onSelect={(rgb) => {
          draftExact(rgb);
          app.commit();
        }}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          try {
            apply(fromHex(colour));
          } catch (error) {
            setError((error as Error).message);
          }
        }}
      >
        <label htmlFor="hex-colour">Hex colour</label>
        <div className="input-action">
          <input
            id="hex-colour"
            value={colour}
            maxLength={7}
            spellCheck={false}
            autoCapitalize="characters"
            onChange={(event) => setColour(event.target.value)}
          />
          <button type="submit" className="secondary-button">
            Use hex
          </button>
        </div>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          try {
            if (rgb.some((v) => !v.trim())) throw new Error('Enter all three colour channels.');
            apply(rgb.map(Number) as unknown as RGB);
          } catch (error) {
            setError((error as Error).message);
          }
        }}
      >
        <div className="rgb-fields">
          {['Red', 'Green', 'Blue'].map((label, i) => (
            <label key={label}>
              {label}
              <input
                aria-label={`${label} channel`}
                type="number"
                min={0}
                max={255}
                step={1}
                required
                value={rgb[i]}
                onChange={(event) => setRgb(rgb.map((v, j) => (i === j ? event.target.value : v)))}
              />
            </label>
          ))}
        </div>
        <button type="submit" className="secondary-button full-width">
          Use RGB
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
