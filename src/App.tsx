import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { controller } from './app-service';
import { hex, rgbToHsv } from './domain/lighting';
import type { Favourite } from './persistence/preferences';
import { DeviceHeader, DeviceDetails, PowerControls } from './components/DeviceControls';
import { Brightness, QuickLevels, ExactColour, Presets } from './components/LightControls';
import { FavouriteEditor, SavedLights } from './components/SavedLights';
import { MoreView } from './components/MoreView';
import { Sheet } from './components/Sheet';
import { Icon } from './components/Icon';
import { ColourWheel } from './components/ColourWheel';
import { DimmerControl } from './components/DimmerControl';
import { PaletteControls } from './components/PaletteControls';
import { LayoutChooser, LAYOUT_DETAILS } from './components/LayoutChooser';
import { SavedShortcuts } from './components/SavedShortcuts';
import { loadControlLayout, saveControlLayout, type ControlLayout } from './persistence/control-layout';

type Modal = { kind: 'device' | 'colour' | 'picker' | 'layouts' | 'saved' | 'options' } | { kind: 'favourite'; favourite?: Favourite; returnToSaved?: boolean } | null;

function shortFeedback(message: string, connected: boolean) {
  if (message.startsWith('Your light,') || message.startsWith('Setting saved here.')) return connected ? 'Adjust a control or tap On to use this setting.' : 'Connect when ready. Your selection is saved here.';
  if (message.startsWith('Ready for next time.')) return 'Ready for next On. Colour changes are held.';
  if (message.startsWith('Off command sent.')) return 'Off command sent. Edits prepare your next On.';
  if (message.startsWith('On command sent with')) return 'On command sent.';
  if (message.startsWith('Sending your command')) return 'Sending…';
  return message;
}

export default function App() {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const { selected, favourites } = state.preferences;
  const [modal, setModal] = useState<Modal>(null);
  const [layoutPreference, setLayoutPreference] = useState(() => loadControlLayout(location.search, () => localStorage));
  const { layout } = layoutPreference;
  useEffect(() => {
    document.documentElement.dataset.layout = layout;
    return () => { delete document.documentElement.dataset.layout; };
  }, [layout]);
  const [rememberedHue, setRememberedHue] = useState(0);
  const [rgbHue, saturation] = rgbToHsv(selected.rgb);
  const hue = saturation === 0 ? rememberedHue : rgbHue;
  const colourProps = { app: controller, settings: selected, hue, onHueChange: setRememberedHue };
  const dismiss = () => setModal(null);
  const chooseLayout = (layout: ControlLayout) => {
    setLayoutPreference({ layout, warning: saveControlLayout(layout, () => localStorage) });
    setModal(null);
    const url = new URL(location.href);
    url.searchParams.set('layout', layout);
    history.replaceState(null, '', url);
  };
  return <div className="app-shell" style={{ '--selection': hex(selected.rgb) } as CSSProperties}>
    <DeviceHeader app={controller} state={state} onDetails={() => setModal({ kind: 'device' })} onOptions={() => setModal({ kind: 'options' })} />
    {state.session.error && <p role="alert" className="error connection-error">{state.session.error}</p>}
    {state.storageWarning && <p role="alert" className="error">{state.storageWarning}</p>}
    {layoutPreference.warning && <p role="status" className="layout-warning">{layoutPreference.warning}</p>}
    <main id="main">
      <div className="light-heading"><h2>LED strip</h2><button className="layout-switch" aria-label="Change control layout" onClick={() => setModal({ kind: 'layouts' })}>{LAYOUT_DETAILS.find(item => item.id === layout)?.name}<Icon name="chevron" size={12} /></button></div>
      {layout === 'wheel' && <>
        <section className="colour-section" aria-labelledby="colour-title">
          <div className="section-heading"><h2 id="colour-title">Colour</h2><button className="text-button" onClick={() => setModal({ kind: 'colour' })}>Edit colour<Icon name="sliders" size={16} /></button></div>
          <ColourWheel {...colourProps} />
        </section>
        <Brightness app={controller} settings={selected} />
      </>}
      {layout === 'palette' && <>
        <PaletteControls app={controller} settings={selected} onCustom={() => setModal({ kind: 'picker' })} />
        <Brightness app={controller} settings={selected} />
      </>}
      {layout === 'dimmer' && <>
        <DimmerControl app={controller} settings={selected} />
        <QuickLevels app={controller} settings={selected} />
        <Presets app={controller} settings={selected} onCustom={() => setModal({ kind: 'picker' })} />
      </>}
      <PowerControls app={controller} state={state} />
      <SavedShortcuts app={controller} favourites={favourites} onSave={() => setModal({ kind: 'favourite' })} onSaved={() => setModal({ kind: 'saved' })} />
      <p className="feedback" role="status" aria-live="polite">{state.session.pending ? 'Sending…' : shortFeedback(state.message, state.session.state === 'connected')}</p>
    </main>
    {modal?.kind === 'device' && <Sheet title="Your strip" onDismiss={dismiss}><DeviceDetails app={controller} state={state} onDone={dismiss} /></Sheet>}
    {modal?.kind === 'colour' && <Sheet title="Exact colour" onDismiss={dismiss}><ExactColour {...colourProps} onDone={dismiss} /></Sheet>}
    {modal?.kind === 'picker' && <Sheet title="Choose a colour" onDismiss={dismiss}><ColourWheel {...colourProps} /><button className="secondary-button full-width" onClick={() => setModal({ kind: 'colour' })}>Fine-tune colour</button></Sheet>}
    {modal?.kind === 'layouts' && <Sheet title="Choose a layout" onDismiss={dismiss}><LayoutChooser selected={layout} onChoose={chooseLayout} /></Sheet>}
    {modal?.kind === 'saved' && <Sheet title="Saved lights" onDismiss={dismiss}><SavedLights app={controller} favourites={favourites} selected={selected} onEdit={favourite => setModal({ kind: 'favourite', favourite, returnToSaved: true })} onUse={dismiss} /></Sheet>}
    {modal?.kind === 'options' && <Sheet title="Options" onDismiss={dismiss}><MoreView app={controller} state={state} onDevice={() => setModal({ kind: 'device' })} /></Sheet>}
    {modal?.kind === 'favourite' && <Sheet title={modal.favourite ? 'Edit saved light' : 'Save this light'} onDismiss={dismiss}><FavouriteEditor app={controller} favourite={modal.favourite} onDone={() => modal.returnToSaved ? setModal({ kind: 'saved' }) : dismiss()} /></Sheet>}
  </div>;
}
