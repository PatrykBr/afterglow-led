import { useState, type CSSProperties } from 'react';
import type { LightingController } from '../controller';
import { hex, type Settings } from '../domain/lighting';
import { favouriteName, type Favourite } from '../persistence/preferences';
import { Icon } from './Icon';

export function SavedLights({ app, favourites, selected, onEdit, onUse }: { app: LightingController; favourites: Favourite[]; selected: Settings; onEdit: (favourite?: Favourite) => void; onUse: () => void }) {
  return <section className="saved-view" aria-labelledby="saved-title">
    <div className="view-heading"><div><h2 id="saved-title">Saved lights</h2><p>Your colours and brightness.</p></div><button className="icon-button bordered" aria-label="Save current selection" onClick={() => onEdit()}><Icon name="plus" /></button></div>
    <div className="current-selection"><span className="colour-swatch" style={{ background: hex(selected.rgb) }} /><div><strong>Current selection</strong><p>{hex(selected.rgb)} at {selected.brightness}%</p></div><button className="text-button" onClick={() => onEdit()}>Save</button></div>
    {favourites.length === 0 ? <div className="empty-state"><span className="empty-symbol"><Icon name="saved" size={30} /></span><h3>Save a light you love</h3><p>Keep a colour and brightness together.<br />Name it for the moment you use it.</p><button className="primary-button" onClick={() => onEdit()}>Save current selection</button></div> : <div className="saved-list">{favourites.map(f => <div className="saved-item" key={f.id}>
      <button className="saved-apply" onClick={() => { app.select(f.settings); onUse(); }}><span className="saved-swatch" style={{ background: hex(f.settings.rgb) }} /><span><strong>{f.name}</strong><small>{f.settings.brightness}% brightness</small></span></button><button className="icon-button" aria-label={`Edit ${f.name}`} onClick={() => onEdit(f)}><Icon name="more" /></button>
    </div>)}</div>}
    <p className="fine-print">Saved only in this browser. Selecting a saved light sends it while connected, unless Off was requested.</p>
  </section>;
}

export function FavouriteEditor({ app, favourite, onDone }: { app: LightingController; favourite?: Favourite; onDone: () => void }) {
  const [name, setName] = useState(favourite?.name || '');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const selection = app.getSnapshot().preferences.selected;
  const settings = favourite?.settings || selection;
  const checkedName = () => { try { return favouriteName(name); } catch (error) { setError((error as Error).message); return undefined; } };
  return <div className="favourite-editor">
    <div className="saved-preview" style={{ '--preview': hex(settings.rgb) } as CSSProperties}><span /><strong>{hex(settings.rgb)}</strong><small>{settings.brightness}% brightness</small></div>
    <form onSubmit={event => { event.preventDefault(); const valid = checkedName(); if (!valid) return; const done = favourite ? app.renameFavourite(favourite.id, valid) : app.saveFavourite(valid); if (done) onDone(); else setError(app.getSnapshot().message); }}>
      <label htmlFor="favourite-name">Name</label><input id="favourite-name" placeholder="e.g. Reading, movie night…" value={name} maxLength={40} required onChange={event => setName(event.target.value)} />
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" className="primary-button full-width">{favourite ? 'Save name' : 'Save light'}</button>
    </form>
    {favourite && <><button className="secondary-button full-width" onClick={() => { const valid = checkedName(); if (valid && app.saveFavourite(valid, favourite.id)) onDone(); }}>Replace with current colour &amp; brightness</button>
      {deleting ? <div className="delete-confirm"><p>Delete {favourite.name}?</p><div><button className="danger-button" onClick={() => { app.deleteFavourite(favourite.id); onDone(); }}>Delete light</button><button className="secondary-button" onClick={() => setDeleting(false)}>Keep it</button></div></div> : <button className="text-button danger full-width" onClick={() => setDeleting(true)}>Delete saved light</button>}</>}
    <p className="fine-print">Saving or editing a name does not change the strip.</p>
  </div>;
}
