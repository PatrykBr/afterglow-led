import { useRef, type PointerEvent } from 'react';

/** One submission on release; a cancelled or lost pointer leaves only a local draft. */
export function useDirectControl(draft: (x: number, y: number, bounds: DOMRect) => void, commit: () => void, cancel: () => void) {
  const active = useRef<number | null>(null);
  const dirty = useRef(false);
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    draft(event.clientX - bounds.left, event.clientY - bounds.top, bounds);
  };
  const cancelPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (active.current !== event.pointerId) return;
    active.current = null;
    dirty.current = false;
    cancel();
  };
  const commitKeyboard = () => {
    if (active.current === null && dirty.current) { dirty.current = false; commit(); }
  };
  return {
    markKeyboardDraft: () => { dirty.current = true; },
    commitKeyboard,
    pointerHandlers: {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (!event.isPrimary || event.button !== 0 || active.current !== null) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        active.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        dirty.current = true;
        update(event);
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => { if (active.current === event.pointerId) update(event); },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
        if (active.current !== event.pointerId) return;
        update(event);
        active.current = null;
        dirty.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        commit();
      },
      onPointerCancel: cancelPointer,
      onLostPointerCapture: cancelPointer,
      onBlur: commitKeyboard,
    },
  };
}
