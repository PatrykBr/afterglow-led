export function Icon({
  name,
  size = 22,
}: {
  name: 'bluetooth' | 'plus' | 'close' | 'saved' | 'more' | 'sliders' | 'chevron';
  size?: number;
}) {
  const paths = {
    bluetooth: <path d="m7 7 10 10-5 4V3l5 4L7 17" />,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    saved: <path d="M6 4h12v17l-6-4-6 4Z" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h8m4 0h4M4 17h3m4 0h9" />
        <circle cx="14" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
