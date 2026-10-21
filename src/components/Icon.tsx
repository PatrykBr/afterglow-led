export function Icon({ name, size = 22 }: { name: 'bluetooth' | 'power' | 'plus' | 'sun' | 'moon' | 'check' | 'arrow' | 'edit'; size?: number }) {
  const paths = {
    bluetooth: <><path d="m7 7 10 10-5 4V3l5 4L7 17" /></>,
    power: <><path d="M12 3v9M6.3 5.8a8 8 0 1 0 11.4 0" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    moon: <path d="M20 14A8 8 0 0 1 10 4 8 8 0 1 0 20 14Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    edit: <><path d="m14 5 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
