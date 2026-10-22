import { useId, type CSSProperties } from 'react';
import type { LightingController } from '../controller';
import { hex, hsvToRgb, rgbToHsv, type Settings } from '../domain/lighting';
import { wheelMarker, wheelSelection } from '../domain/control-geometry';
import { useDirectControl } from './use-direct-control';

export type ColourWheelProps = {
  app: LightingController;
  settings: Settings;
  hue: number;
  onHueChange: (hue: number) => void;
};
const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

export function ColourWheel({ app, settings, hue, onHueChange }: ColourWheelProps) {
  const [, saturation] = rgbToHsv(settings.rgb);
  const instructions = useId();
  const marker = wheelMarker(hue, saturation);
  const draft = (h: number, s: number) => {
    onHueChange(h);
    app.select({ ...app.getSnapshot().preferences.selected, rgb: hsvToRgb(h, s) }, false);
  };
  const control = useDirectControl(
    (x, y, bounds) => {
      const next = wheelSelection(x, y, bounds.width, bounds.height, hue);
      draft(next.hue, next.saturation);
    },
    () => app.commit(),
    () => app.notify('Colour prepared. Adjust a control or tap On to send it.'),
  );
  return (
    <div className="wheel-stage">
      <div
        className="colour-wheel"
        role="slider"
        tabIndex={0}
        aria-label="Colour wheel"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={Math.min(359, Math.round(hue))}
        aria-valuetext={`${hex(settings.rgb)}, hue ${Math.round(hue)} degrees, saturation ${Math.round(saturation * 100)} percent`}
        aria-describedby={instructions}
        style={{ '--marker-x': `${marker.x}%`, '--marker-y': `${marker.y}%` } as CSSProperties}
        {...control.pointerHandlers}
        onKeyDown={(event) => {
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const step = event.shiftKey ? 10 : 1;
          const h =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? 359
                : event.key === 'ArrowLeft'
                  ? (hue - step + 360) % 360
                  : event.key === 'ArrowRight'
                    ? (hue + step) % 360
                    : hue;
          const s = Math.max(
            0,
            Math.min(
              1,
              saturation +
                (event.key === 'ArrowUp'
                  ? step / 100
                  : event.key === 'ArrowDown'
                    ? -step / 100
                    : 0),
            ),
          );
          control.markKeyboardDraft();
          draft(h, s);
        }}
        onKeyUp={(event) => {
          if (keys.includes(event.key)) control.commitKeyboard();
        }}
      >
        <span className="wheel-marker" style={{ background: hex(settings.rgb) }} />
      </div>
      <p className="control-hint" id={instructions}>
        Drag to choose. Move inward for softer colour.
        <span className="sr-only">
          {' '}
          Left and right arrows change hue; up and down change saturation. Edit colour provides
          separate labelled sliders.
        </span>
      </p>
    </div>
  );
}
