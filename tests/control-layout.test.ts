import { describe, expect, it } from 'vitest';
import { dimmerSelection, wheelMarker, wheelSelection } from '../src/domain/control-geometry';
import { loadControlLayout, saveControlLayout } from '../src/persistence/control-layout';

describe('colour wheel input', () => {
  it.each([[200, 100, 0], [100, 200, 90], [0, 100, 180], [100, 0, 270]])('maps the point (%s,%s) to hue %s', (x, y, hue) => {
    expect(wheelSelection(x, y, 200, 200, 30)).toEqual({ hue, saturation: 1 });
  });
  it('preserves hue at white and clamps a drag outside the circle', () => {
    expect(wheelSelection(100, 100, 200, 200, 123)).toEqual({ hue: 123, saturation: 0 });
    expect(wheelSelection(500, 100, 200, 200, 123)).toEqual({ hue: 0, saturation: 1 });
    expect(wheelSelection(150, 100, 200, 200, 123).saturation).toBe(.5);
  });
  it.each([0, 30, 120, 239, 359])('places the marker at the same colour selected by a touch, hue %s', hue => {
    const marker = wheelMarker(hue, .75);
    const selected = wheelSelection(marker.x * 2, marker.y * 2, 200, 200, 0);
    expect(selected.hue).toBeCloseTo(hue);
    expect(selected.saturation).toBeCloseTo(.75);
  });
  it('handles a control with no dimensions', () => {
    expect(wheelSelection(0, 0, 0, 0, 45)).toEqual({ hue: 45, saturation: 0 });
  });
});

describe('dimmer input', () => {
  it.each([[-20, 100], [0, 100], [60, 75], [120, 50], [239, 1], [400, 1]])('maps vertical position %s to %s percent without using Off', (y, brightness) => {
    expect(dimmerSelection(y, 240)).toBe(brightness);
  });
});

describe('control layout preferences', () => {
  it('lets a valid comparison link override the saved choice', () => {
    const storage = { getItem: () => 'dimmer', setItem: () => {} };
    expect(loadControlLayout('?layout=palette', () => storage).layout).toBe('palette');
    expect(loadControlLayout('?layout=unknown', () => storage).layout).toBe('dimmer');
  });
  it('round trips the choice without changing the lighting preferences', () => {
    const data = new Map<string, string>([['afterglow.preferences.v1', 'lighting settings']]);
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
    saveControlLayout('palette', () => storage);
    expect(loadControlLayout('', () => storage).layout).toBe('palette');
    expect(data.get('afterglow.preferences.v1')).toBe('lighting settings');
  });
  it('handles corrupt and unavailable storage', () => {
    expect(loadControlLayout('', () => ({ getItem: () => 'bad', setItem: () => {} })).warning).toBeTruthy();
    const unavailable = () => { throw Error('Storage blocked'); };
    expect(loadControlLayout('', unavailable)).toMatchObject({ layout: 'wheel', warning: expect.any(String) });
    expect(saveControlLayout('dimmer', unavailable)).toBeTruthy();
  });
});
