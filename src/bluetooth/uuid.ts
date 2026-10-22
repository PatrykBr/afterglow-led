const BASE_SUFFIX = '-0000-1000-8000-00805f9b34fb';

/** Compare Bluetooth identities, including short UUIDs returned by native bridges. */
export function canonicalBluetoothUuid(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const uuid = value.trim().toLowerCase();
  const alias = uuid.replace(/^0x/, '');
  if (/^(?:[0-9a-f]{4}|[0-9a-f]{8})$/.test(alias)) return alias.padStart(8, '0') + BASE_SUFFIX;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(uuid)) return uuid;
  if (/^[0-9a-f]{32}$/.test(uuid))
    return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
  return undefined;
}
