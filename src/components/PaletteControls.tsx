import type { CSSProperties } from 'react';
import type { LightingController } from '../controller';
import { hex, type Settings, type RGB } from '../domain/lighting';
import { Icon } from './Icon';

const COLOURS: { name: string; rgb: RGB }[] = [
  { name: 'Warm', rgb: [255, 224, 190] }, { name: 'Amber', rgb: [255, 169, 64] },
  { name: 'Rose', rgb: [255, 80, 140] }, { name: 'Red', rgb: [255, 45, 60] },
  { name: 'Peach', rgb: [255, 158, 117] }, { name: 'Lilac', rgb: [168, 124, 255] },
  { name: 'Ice', rgb: [160, 229, 255] }, { name: 'Ocean', rgb: [38, 146, 255] },
  { name: 'Mint', rgb: [49, 255, 183] }, { name: 'Green', rgb: [86, 220, 100] },
  { name: 'Indigo', rgb: [93, 85, 255] }, { name: 'Pearl', rgb: [255, 250, 240] },
];

export function PaletteControls({ app, settings, onCustom }: { app: LightingController; settings: Settings; onCustom: () => void }) {
  return <section className="palette-section" aria-labelledby="palette-title">
    <div className="section-heading"><h2 id="palette-title">Choose a colour</h2><button className="text-button" onClick={onCustom}>Custom<Icon name="sliders" size={16} /></button></div>
    <div className="colour-palette">{COLOURS.map(colour => <button className="palette-colour" key={colour.name} aria-pressed={hex(settings.rgb) === hex(colour.rgb)} onClick={() => app.select({ ...settings, rgb: colour.rgb })}>
      <span style={{ '--swatch': hex(colour.rgb) } as CSSProperties}>{hex(settings.rgb) === hex(colour.rgb) && <Icon name="check" size={20} />}</span><span>{colour.name}</span>
    </button>)}</div>
  </section>;
}
