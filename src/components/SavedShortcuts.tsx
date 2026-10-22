import type { LightingController } from '../controller';
import type { Favourite } from '../persistence/preferences';
import { hex } from '../domain/lighting';
import { Icon } from './Icon';

export function SavedShortcuts({
  app,
  favourites,
  onSaved,
  onSave,
}: {
  app: LightingController;
  favourites: Favourite[];
  onSaved: () => void;
  onSave: () => void;
}) {
  return (
    <section className="saved-shortcuts" aria-label="Saved colours and brightness">
      <div className="saved-actions">
        <button className="text-button" aria-label="Saved lights" onClick={onSaved}>
          Saved lights{favourites.length > 0 && <span aria-hidden="true">{favourites.length}</span>}
        </button>
        <button className="text-button" onClick={onSave}>
          <Icon name="plus" size={16} />
          Save this light
        </button>
      </div>
      {favourites.length > 0 && (
        <div className="saved-chips">
          {favourites.slice(0, 3).map((favourite) => (
            <button key={favourite.id} onClick={() => app.select(favourite.settings)}>
              <span style={{ background: hex(favourite.settings.rgb) }} />
              {favourite.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
