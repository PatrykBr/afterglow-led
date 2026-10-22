const INTERACTIVE =
  'button, input, textarea, select, a, summary, [role="slider"], [contenteditable]';

/** Native, non-passive touch listeners let a sheet drag without stealing scrolls or control gestures. */
export function attachSheetSwipe(dialog: HTMLDialogElement, dismiss: () => void) {
  let gesture: { id: number; x: number; y: number; dragging: boolean } | undefined;
  const reset = () => {
    gesture = undefined;
    delete dialog.dataset.dragging;
    dialog.style.removeProperty('--sheet-drag');
  };
  const start = (event: TouchEvent) => {
    reset();
    const target = event.target as HTMLElement;
    if (event.touches.length !== 1 || target.closest(INTERACTIVE)) return;
    if (dialog.scrollTop > 0) return;
    const touch = event.touches[0];
    gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, dragging: false };
  };
  const move = (event: TouchEvent) => {
    if (!gesture) return;
    const touch = event.touches[0];
    if (event.touches.length !== 1 || touch.identifier !== gesture.id) {
      reset();
      return;
    }
    const dx = touch.clientX - gesture.x;
    const dy = touch.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (dy <= 0 || Math.abs(dx) > dy || dialog.scrollTop > 0) {
        reset();
        return;
      }
      gesture.dragging = true;
      dialog.dataset.dragging = 'true';
    }
    event.preventDefault();
    dialog.style.setProperty('--sheet-drag', `${Math.max(0, dy)}px`);
  };
  const end = (event: TouchEvent) => {
    const touch = Array.from(event.changedTouches).find(
      (touch) => touch.identifier === gesture?.id,
    );
    const shouldDismiss = gesture?.dragging && touch && touch.clientY - gesture.y >= 72;
    reset();
    if (shouldDismiss) dismiss();
  };
  dialog.addEventListener('touchstart', start, { passive: true });
  dialog.addEventListener('touchmove', move, { passive: false });
  dialog.addEventListener('touchend', end);
  dialog.addEventListener('touchcancel', reset);
  return () => {
    dialog.removeEventListener('touchstart', start);
    dialog.removeEventListener('touchmove', move);
    dialog.removeEventListener('touchend', end);
    dialog.removeEventListener('touchcancel', reset);
    reset();
  };
}
