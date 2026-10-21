export const CONTROL_LAYOUTS = ['wheel', 'palette', 'dimmer'] as const;
export type ControlLayout = typeof CONTROL_LAYOUTS[number];
type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
const KEY = 'afterglow.control-layout.v1';
const valid = (value: unknown): value is ControlLayout => CONTROL_LAYOUTS.some(layout => layout === value);

export function loadControlLayout(search: string, storage: () => StorageAdapter): { layout: ControlLayout; warning?: string } {
  const query = new URLSearchParams(search).get('layout');
  if (valid(query)) return { layout: query };
  try {
    const saved = storage().getItem(KEY);
    if (valid(saved)) return { layout: saved };
    return { layout: 'wheel', ...(saved ? { warning: 'The saved layout was invalid. Using the colour wheel.' } : {}) };
  } catch { return { layout: 'wheel', warning: 'Your layout choice cannot be restored in this browser.' }; }
}

export function saveControlLayout(layout: ControlLayout, storage: () => StorageAdapter): string | undefined {
  try { storage().setItem(KEY, layout); }
  catch { return 'This layout is available for this visit. The browser could not save your choice.'; }
}
