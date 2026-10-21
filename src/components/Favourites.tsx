import { useState } from 'react';
import type { LightingController } from '../controller';
import { hex } from '../domain/lighting';
import type { Favourite } from '../persistence/preferences';
import { Icon } from './Icon';

export function Favourites({ app, favourites }: { app: LightingController; favourites: Favourite[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const open = (id: string, value: string) => { setEditing(id); setName(value); };
  return <section className="favourites" aria-labelledby="favourites-heading">
    <div className="section-heading"><div><h2 id="favourites-heading">Keep the good ones</h2><p>Your colours, saved on this device.</p></div><button className="save-button" onClick={() => open('new', '')}><Icon name="plus" size={18} />Save</button></div>
    {favourites.length === 0 && editing !== 'new' && <button className="empty-favourites" onClick={() => open('new', '')}><span className="empty-icon"><Icon name="plus" /></span><span><strong>A light for every kind of evening</strong><small>Save this colour and brightness as a favourite.</small></span></button>}
    <div className="favourite-list">{favourites.map(f => <div className="favourite-row" key={f.id}>
      <button className="favourite-apply" onClick={() => app.select(f.settings)}><span className="favourite-swatch" style={{ background: hex(f.settings.rgb) }} /><span><strong>{f.name}</strong><small>{hex(f.settings.rgb)} / {f.settings.brightness}%</small></span></button>
      <button className="edit-button" aria-label={`Edit ${f.name}`} onClick={() => open(f.id, f.name)}><Icon name="edit" size={19} /></button>
    </div>)}</div>
    {editing && <form className="favourite-editor" onSubmit={event => { event.preventDefault(); const done = editing === 'new' ? app.saveFavourite(name) : app.renameFavourite(editing, name); if (done) setEditing(null); }}>
      <label htmlFor="favourite-name">{editing === 'new' ? 'Name this setting' : 'Edit favourite'}</label>
      <input id="favourite-name" autoFocus placeholder="e.g. Slow Sunday" value={name} maxLength={40} required onChange={event => setName(event.target.value)} />
      <div className="editor-actions"><button type="submit" className="connect-button">{editing === 'new' ? 'Save favourite' : 'Rename'}</button><button type="button" className="quiet-button" onClick={() => setEditing(null)}>Cancel</button></div>
      {editing !== 'new' && <div className="editor-actions"><button type="button" className="text-button" onClick={() => { if (app.saveFavourite(name, editing)) setEditing(null); }}>Replace with current selection</button><button type="button" className="text-button danger" onClick={() => { app.deleteFavourite(editing); setEditing(null); }}>Delete</button></div>}
    </form>}
  </section>;
}
