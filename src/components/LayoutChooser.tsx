import type { ControlLayout } from '../persistence/control-layout';
import { Icon } from './Icon';

export const LAYOUT_DETAILS: { id: ControlLayout; name: string; detail: string }[] = [
  { id: 'wheel', name: 'Colour wheel', detail: 'Explore colours with one large, touchable wheel.' },
  { id: 'palette', name: 'Colour palette', detail: 'Tap a named colour. A brighter, simpler screen.' },
  { id: 'dimmer', name: 'Everyday dimmer', detail: 'A large brightness control with colour close by.' },
];
export function LayoutChooser({ selected, onChoose }: { selected: ControlLayout; onChoose: (layout: ControlLayout) => void }) {
  return <div className="layout-chooser">
    <p className="sheet-description">Try a different way to control your strip. Switching keeps your connection and leaves the lights unchanged.</p>
    {LAYOUT_DETAILS.map(layout => <button className="layout-choice" key={layout.id} aria-pressed={layout.id === selected} onClick={() => onChoose(layout.id)}>
      <span className={`layout-miniature miniature-${layout.id}`} aria-hidden="true"><span /></span>
      <span><strong>{layout.name}</strong><small>{layout.detail}</small></span>
      {layout.id === selected ? <Icon name="check" size={20} /> : <Icon name="chevron" size={17} />}
    </button>)}
  </div>;
}
