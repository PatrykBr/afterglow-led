export type RGB = readonly [number, number, number];
export type Settings = { rgb: RGB; brightness: number };
export type RequestedPower = 'unknown' | 'on' | 'off';
export const DEFAULT_SETTINGS: Settings = { rgb: [255, 142, 92], brightness: 50 };

export function validateSettings(value: unknown): Settings {
  const s = value as Settings | null;
  if (!s || !Array.isArray(s.rgb) || s.rgb.length !== 3 ||
    !s.rgb.every(v => Number.isInteger(v) && v >= 0 && v <= 255) ||
    s.rgb.every(v => v === 0) || !Number.isInteger(s.brightness) ||
    s.brightness < 1 || s.brightness > 100) {
    throw new Error('Choose a non-black RGB colour and brightness from 1 to 100%.');
  }
  return { rgb: [...s.rgb] as unknown as RGB, brightness: s.brightness };
}

export const hex = (rgb: RGB) => '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
export function fromHex(value: string): RGB {
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Use six hexadecimal digits, such as #FF8E5C.');
  const rgb = [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16)) as unknown as RGB;
  return validateSettings({ rgb, brightness: 50 }).rgb;
}

export function rgbToHsv(rgb: RGB): [number, number, number] {
  const [r, g, b] = rgb.map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, max ? d / max : 0, max];
}

export function hsvToRgb(h: number, s: number, v = 1): RGB {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  const channels = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return channels.map(n => Math.round((n + m) * 255)) as unknown as RGB;
}

export const PRESETS: { name: string; rgb: RGB }[] = [
  { name: 'Ember', rgb: [255, 104, 47] },
  { name: 'Rose', rgb: [255, 80, 140] },
  { name: 'Lilac', rgb: [168, 124, 255] },
  { name: 'Ocean', rgb: [38, 146, 255] },
  { name: 'Mint', rgb: [49, 255, 183] },
  { name: 'Soft white', rgb: [255, 224, 190] },
];
