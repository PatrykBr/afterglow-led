import { validateSettings, type Settings } from '../domain/lighting';

export const SERVICE = '0000eea0-0000-1000-8000-00805f9b34fb';
export const CHARACTERISTIC = '0000ee01-0000-1000-8000-00805f9b34fb';
export type Command = { kind: 'colour' | 'on'; settings: Settings } | { kind: 'off' };

export function encode(command: Command): Uint8Array<ArrayBuffer> {
  if (command.kind === 'off') return new Uint8Array([0x69, 0x96, 2, 1, 0]);
  const { rgb, brightness } = validateSettings(command.settings);
  const factor = brightness / 100;
  const scalar = Math.floor(255 * factor);
  if (command.kind === 'on') return new Uint8Array([0x69, 0x96, 6, 1, 1, ...rgb, scalar]);
  return new Uint8Array([0x69, 0x96, 5, 2, ...rgb.map((v) => Math.floor(v * factor)), scalar]);
}

export const packetHex = (bytes: Uint8Array) =>
  Array.from(bytes, (v) => v.toString(16).padStart(2, '0'))
    .join(' ')
    .toUpperCase();
