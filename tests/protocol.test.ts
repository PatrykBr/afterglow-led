import { describe, expect, it } from 'bun:test';
import { fromHex, hsvToRgb, rgbToHsv, validateSettings } from '../src/domain/lighting';
import { encode, packetHex } from '../src/protocol/bojia';

describe('verified Bojia frames', () => {
  it.each([
    [[255, 0, 0], 25, '69 96 05 02 3F 00 00 3F'],
    [[0, 255, 0], 50, '69 96 05 02 00 7F 00 7F'],
    [[0, 0, 255], 100, '69 96 05 02 00 00 FF FF'],
    [[255, 128, 1], 1, '69 96 05 02 02 01 00 02'],
  ] as const)('encodes RGB %j at %i%% with floor rounding', (rgb, brightness, expected) => {
    const frame = encode({ kind: 'colour', settings: { rgb, brightness } });
    expect(frame).toBeInstanceOf(Uint8Array);
    expect(packetHex(frame)).toBe(expected);
    expect(frame[2]).toBe(frame.length - 3);
  });
  it('encodes Off exactly', () =>
    expect(packetHex(encode({ kind: 'off' }))).toBe('69 96 02 01 00'));
  it.each([
    [[0, 0, 255], '69 96 06 01 01 00 00 FF 3F'],
    [[255, 0, 0], '69 96 06 01 01 FF 00 00 3F'],
  ] as const)('encodes On using unscaled RGB %j', (rgb, expected) =>
    expect(packetHex(encode({ kind: 'on', settings: { rgb, brightness: 25 } }))).toBe(expected),
  );
});

describe('settings validation', () => {
  it.each([
    { rgb: [0, 0, 0], brightness: 25 },
    { rgb: [-1, 0, 255], brightness: 25 },
    { rgb: [256, 0, 0], brightness: 25 },
    { rgb: [1.5, 2, 3], brightness: 25 },
    { rgb: [255, 0], brightness: 25 },
    { rgb: [255, 0, 0], brightness: 0 },
    { rgb: [255, 0, 0], brightness: 101 },
    { rgb: [255, 0, 0], brightness: 50.5 },
    { rgb: [255, 0, 0], brightness: NaN },
    null,
  ])('rejects invalid input %j', (value) => expect(() => validateSettings(value)).toThrow());
  it('accepts a valid low channel without silently replacing it', () =>
    expect(validateSettings({ rgb: [1, 0, 0], brightness: 1 }).rgb).toEqual([1, 0, 0]));
  it('validates custom hex colours', () => {
    expect(fromHex('#Ff8000')).toEqual([255, 128, 0]);
    expect(() => fromHex('#000000')).toThrow();
    expect(() => fromHex('invalid')).toThrow();
  });
  it('round trips saturated and desaturated colours', () => {
    for (const rgb of [
      [255, 80, 140],
      [70, 120, 230],
      [255, 255, 255],
    ] as const)
      expect(hsvToRgb(...rgbToHsv(rgb))).toEqual(rgb);
  });
});
