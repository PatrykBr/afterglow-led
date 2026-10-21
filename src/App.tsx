import { useState, useSyncExternalStore, type CSSProperties } from 'react';
import { controller } from './app-service';
import { hex, rgbToHsv } from './domain/lighting';
import type { Favourite } from './persistence/preferences';
import { DeviceHeader, DeviceDetails, PowerControls } from './components/DeviceControls';
import { Brightness, ColourPad, ExactColour, Presets } from './components/LightControls';
import { FavouriteEditor, SavedLights } from './components/SavedLights';
import { MoreView } from './components/MoreView';
import { Sheet } from './components/Sheet';
import { Icon } from './components/Icon';

type View = 'light' | 'saved' | 'more';
type Modal = { kind: 'device' | 'colour' } | { kind: 'favourite'; favourite?: Favourite } | null;

function shortFeedback(message: string) {
  if (message.startsWith('Your light,') || message.startsWith('Setting saved here.')) return 'Connect to send your selection.';
  if (message.startsWith('Ready for next time.')) return 'Ready for next On. Colour changes are held.';
  if (message.startsWith('Off command sent.')) return 'Off command sent. Edits prepare your next On.';
  if (message.startsWith('On command sent with')) return 'On command sent.';
  if (message.startsWith('Sending your command')) return 'Sending…';
  return message;
}

export default function App() {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const { selected, favourites } = state.preferences;
  const [view, setView] = useState<View>('light');
  const [modal, setModal] = useState<Modal>(null);
  const [rememberedHue, setRememberedHue] = useState(0);
  const [rgbHue, saturation] = rgbToHsv(selected.rgb);
  const hue = saturation === 0 ? rememberedHue : rgbHue;
  const colourProps = { app: controller, settings: selected, hue, onHueChange: setRememberedHue };
  const dismiss = () => setModal(null);
  const changeView = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: 'auto' }); };
  return <div className="app-shell" style={{ '--selection': hex(selected.rgb) } as CSSProperties}>
    <DeviceHeader app={controller} state={state} onDetails={() => setModal({ kind: 'device' })} />
    {state.session.error && <p role="alert" className="error connection-error">{state.session.error}</p>}
    {state.storageWarning && <p role="alert" className="error">{state.storageWarning}</p>}
    <main id="main">
      {view === 'light' && <div className="light-view">
        <PowerControls app={controller} state={state} />
        <section className="colour-section" aria-labelledby="colour-title">
          <div className="section-heading"><h2 id="colour-title" tabIndex={-1}>Colour</h2><button className="colour-value" aria-label={`Exact colour, ${hex(selected.rgb)}`} onClick={() => setModal({ kind: 'colour' })}><span style={{ background: hex(selected.rgb) }} />{hex(selected.rgb)}<Icon name="sliders" size={16} /></button></div>
          <ColourPad {...colourProps} />
        </section>
        <Brightness app={controller} settings={selected} />
        <Presets app={controller} settings={selected} onSave={() => setModal({ kind: 'favourite' })} />
      </div>}
      {view === 'saved' && <SavedLights app={controller} favourites={favourites} selected={selected} onEdit={favourite => setModal({ kind: 'favourite', favourite })} onUse={() => { changeView('light'); requestAnimationFrame(() => document.getElementById('colour-title')?.focus()); }} />}
      {view === 'more' && <MoreView app={controller} state={state} onDevice={() => setModal({ kind: 'device' })} />}
      <p className="feedback" role="status" aria-live="polite"><span className={`feedback-dot ${state.session.pending ? 'sending' : ''}`} />{state.session.pending ? 'Sending…' : shortFeedback(state.message)}</p>
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">{([
      { id: 'light', label: 'Light', icon: 'sun' }, { id: 'saved', label: 'Saved', icon: 'saved' }, { id: 'more', label: 'More', icon: 'more' },
    ] as const).map(item => <button key={item.id} aria-current={view === item.id ? 'page' : undefined} onClick={() => changeView(item.id)}><Icon name={item.icon} size={22} /><span>{item.label}</span></button>)}</nav>
    {modal?.kind === 'device' && <Sheet title="Your strip" onDismiss={dismiss}><DeviceDetails app={controller} state={state} onDone={dismiss} /></Sheet>}
    {modal?.kind === 'colour' && <Sheet title="Exact colour" onDismiss={dismiss}><ExactColour {...colourProps} onDone={dismiss} /></Sheet>}
    {modal?.kind === 'favourite' && <Sheet title={modal.favourite ? 'Edit saved light' : 'Save this light'} onDismiss={dismiss}><FavouriteEditor app={controller} favourite={modal.favourite} onDone={dismiss} /></Sheet>}
  </div>;
}
