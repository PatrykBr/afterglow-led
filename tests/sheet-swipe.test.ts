import { describe, expect, it, vi } from 'vitest';
import { attachSheetSwipe } from '../src/components/sheet-swipe';

// Exercise the native listener boundary, including scroll/default cancellation.
class Tray extends EventTarget {
  scrollTop = 0;
  interactive = false;
  dataset: Record<string, string> = {};
  properties = new Map<string, string>();
  style = {
    setProperty: (key: string, value: string) => this.properties.set(key, value),
    removeProperty: (key: string) => this.properties.delete(key),
  };
  closest() { return this.interactive; }
  touch(type: string, x: number, y: number, count = 1) {
    const event = new Event(type, { cancelable: true });
    const touch = { identifier: 1, clientX: x, clientY: y };
    Object.defineProperties(event, {
      touches: { value: type === 'touchend' ? [] : Array(count).fill(touch) },
      changedTouches: { value: [touch] },
    });
    this.dispatchEvent(event);
    return event;
  }
}

function setup() {
  const tray = new Tray();
  const dismiss = vi.fn();
  const remove = attachSheetSwipe(tray as unknown as HTMLDialogElement, dismiss);
  return { tray, dismiss, remove };
}

describe('sheet swipe dismissal', () => {
  it('follows a downward drag and dismisses after release', () => {
    const { tray, dismiss } = setup();
    tray.touch('touchstart', 100, 100);
    expect(tray.touch('touchmove', 104, 190).defaultPrevented).toBe(true);
    expect(tray.properties.get('--sheet-drag')).toBe('90px');
    expect(dismiss).not.toHaveBeenCalled();
    tray.touch('touchend', 104, 190);
    expect(dismiss).toHaveBeenCalledOnce();
    expect(tray.properties.size).toBe(0);
  });
  it('returns a short drag to its starting position', () => {
    const { tray, dismiss } = setup();
    tray.touch('touchstart', 100, 100);
    tray.touch('touchmove', 100, 140);
    tray.touch('touchend', 100, 140);
    expect(dismiss).not.toHaveBeenCalled();
    expect(tray.properties.size).toBe(0);
    expect(tray.dataset.dragging).toBeUndefined();
  });
  it.each([[190, 110], [100, 10]])('leaves horizontal and upward gestures to the browser (%s,%s)', (x, y) => {
    const { tray, dismiss } = setup();
    tray.touch('touchstart', 100, 100);
    expect(tray.touch('touchmove', x, y).defaultPrevented).toBe(false);
    tray.touch('touchend', x, y);
    expect(dismiss).not.toHaveBeenCalled();
  });
  it('scrolls content instead of closing when already scrolled', () => {
    const { tray, dismiss } = setup();
    tray.scrollTop = 80;
    tray.touch('touchstart', 100, 100);
    tray.scrollTop = 0;
    expect(tray.touch('touchmove', 100, 220).defaultPrevented).toBe(false);
    tray.touch('touchend', 100, 220);
    expect(dismiss).not.toHaveBeenCalled();
  });
  it('leaves sliders, fields, links and buttons alone', () => {
    const { tray, dismiss } = setup();
    tray.interactive = true;
    tray.touch('touchstart', 100, 100);
    expect(tray.touch('touchmove', 100, 220).defaultPrevented).toBe(false);
    tray.touch('touchend', 100, 220);
    expect(dismiss).not.toHaveBeenCalled();
  });
  it.each(['touchcancel', 'multitouch'])('resets without dismissing on %s', reason => {
    const { tray, dismiss } = setup();
    tray.touch('touchstart', 100, 100);
    tray.touch('touchmove', 100, 200);
    if (reason === 'touchcancel') tray.touch('touchcancel', 100, 200);
    else tray.touch('touchmove', 100, 220, 2);
    tray.touch('touchend', 100, 220);
    expect(dismiss).not.toHaveBeenCalled();
    expect(tray.properties.size).toBe(0);
  });
  it('removes listeners and clears an unfinished drag on unmount', () => {
    const { tray, dismiss, remove } = setup();
    tray.touch('touchstart', 100, 100);
    tray.touch('touchmove', 100, 200);
    remove();
    tray.touch('touchend', 100, 200);
    expect(dismiss).not.toHaveBeenCalled();
    expect(tray.properties.size).toBe(0);
  });
});
