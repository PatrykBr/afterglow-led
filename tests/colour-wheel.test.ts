import { describe, expect, it } from 'bun:test';
import { wheelMarker, wheelSelection } from '../src/domain/control-geometry';

describe('colour wheel input', () => {
  it.each([
    [200, 100, 0],
    [100, 200, 90],
    [0, 100, 180],
    [100, 0, 270],
  ])('maps the point (%s,%s) to hue %s', (x, y, hue) => {
    expect(wheelSelection(x, y, 200, 200, 30)).toEqual({ hue, saturation: 1 });
  });
  it('preserves hue at white and clamps a drag outside the circle', () => {
    expect(wheelSelection(100, 100, 200, 200, 123)).toEqual({ hue: 123, saturation: 0 });
    expect(wheelSelection(500, 100, 200, 200, 123)).toEqual({ hue: 0, saturation: 1 });
    expect(wheelSelection(150, 100, 200, 200, 123).saturation).toBe(0.5);
  });
  it.each([0, 30, 120, 239, 359])(
    'places the marker at the same colour selected by a touch, hue %s',
    (hue) => {
      const marker = wheelMarker(hue, 0.75);
      const selected = wheelSelection(marker.x * 2, marker.y * 2, 200, 200, 0);
      expect(selected.hue).toBeCloseTo(hue);
      expect(selected.saturation).toBeCloseTo(0.75);
    },
  );
  it('handles a control with no dimensions', () => {
    expect(wheelSelection(0, 0, 0, 0, 45)).toEqual({ hue: 45, saturation: 0 });
  });
});
