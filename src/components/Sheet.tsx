import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Sheet({ title, onDismiss, children }: { title: string; onDismiss: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={ref} className="sheet" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onClick={event => { if (event.target === event.currentTarget) onDismiss(); }}>
    <div className="sheet-content">
      <div className="sheet-grip" aria-hidden="true" />
      <header className="sheet-header"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label={`Close ${title}`} onClick={onDismiss} autoFocus><Icon name="close" /></button></header>
      {children}
    </div>
  </dialog>;
}
