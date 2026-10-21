import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import { attachSheetSwipe } from './sheet-swipe';

export function Sheet({ title, onDismiss, children }: { title: string; onDismiss: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const dismissRef = useRef(onDismiss);
  useEffect(() => { dismissRef.current = onDismiss; }, [onDismiss]);
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    headingRef.current?.focus({ preventScroll: true });
    const removeSwipe = attachSheetSwipe(dialog, () => dismissRef.current());
    return () => {
      removeSwipe();
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} className="sheet" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onClick={event => { if (event.target === event.currentTarget) onDismiss(); }}>
    <div className="sheet-content">
      <div className="sheet-drag-area">
        <div className="sheet-grip" aria-hidden="true" />
        <header className="sheet-header"><h2 ref={headingRef} id={titleId} tabIndex={-1}>{title}</h2><button className="icon-button" aria-label={`Close ${title}`} onClick={onDismiss}><Icon name="close" /></button></header>
      </div>
      {children}
    </div>
  </dialog>;
}
