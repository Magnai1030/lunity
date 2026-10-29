const PATHS = {
  heart: ["M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.9a4.2 4.2 0 0 1 7.5 2.3c0 5.7-7.5 10.3-7.5 10.3z"],
  plus: ["M12 5v14M5 12h14"],
  minus: ["M5 12h14"],
  bag: ["M6 8h12l-1 12H7L6 8z", "M9 8V7a3 3 0 0 1 6 0v1"],
  search: ["M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12z", "M20 20l-4.5-4.5"],
  close: ["M6 6l12 12M18 6L6 18"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  shield: ["M12 3l7 3v5.5c0 4.3-2.9 8-7 9.5-4.1-1.5-7-5.2-7-9.5V6z", "M9 12l2.2 2.2L15.5 10"],
  arrow: ["M5 12h14M13 6l6 6-6 6"],
  back: ["M19 12H5M11 6l-6 6 6 6"],
  chevron: ["M9 6l6 6-6 6"],
  alert: ["M12 4l9 16H3z", "M12 10v4", "M12 17v.01"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  filter: ["M4 7h10M18 7h2M4 17h2M10 17h10", "M16 5v4M8 15v4"],
  grid: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
  palette: [
    "M12 4a8 8 0 1 0 0 16c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a4 4 0 0 0 4-4C20 6.9 16.4 4 12 4z",
    "M7.5 11.5h.01M10 8h.01M14 8h.01M16.5 11h.01",
  ],
  brush: ["M20 4l-8.5 8.5", "M11.5 12.5c-1.9-.4-3.7.6-4 2.5-.2 1.4-.9 2.5-2.5 3 2.6 1.3 5.8.8 7.2-1.2.9-1.3.6-3.2-.7-4.3z"],
  image: ["M4 5h16v14H4z", "M4 15l4.5-4.5L13 15l2.5-2.5L20 17"],
  cup: ["M5 9h12v4a6 6 0 0 1-12 0z", "M17 10h1.5a2.5 2.5 0 0 1 0 5H16", "M4 20h14", "M9 3.5v2.5M13 3.5v2.5"],
  home: ["M4 11l8-6.5 8 6.5", "M6 9.5V20h12V9.5", "M10 20v-5h4v5"],
  box: ["M12 3l8 4.5v9L12 21l-8-4.5v-9z", "M4 7.5l8 4.5 8-4.5M12 12v9"],
  star: ["M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"],
  tag: ["M3.5 12.5V4.5h8l9 9-8 8z", "M8 8h.01"],
  receipt: ["M5 4h14v16H5z", "M5 9h14M9 4v5"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4.5 20a7.5 7.5 0 0 1 15 0"],
  bell: ["M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z", "M10 20.5a2 2 0 0 0 4 0"],
  settings: ["M4 7h9M17 7h3M4 17h3M11 17h9", "M15 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  help: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6", "M12 17v.01"],
  book: ["M5 4.5h5a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H5z", "M19 4.5h-5a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h5z"],
  logout: ["M14 5h5v14h-5", "M10 12h-7M6 8.5L2.5 12 6 15.5"],
  card: ["M3 6h18v12H3z", "M3 10h18M7 15h3"],
  bank: ["M3 9l9-5 9 5", "M5 9v8M9.5 9v8M14.5 9v8M19 9v8M3 19.5h18"],
  mail: ["M3.5 6h17v12h-17z", "M4 6.5l8 6.5 8-6.5"],
  external: ["M14 4h6v6", "M20 4l-9 9", "M18 14v6H4V6h6"],
  phone: ["M5 4h4l1.5 4.5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5L20 15v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  undo: ["M9 14L4 9l5-5", "M4 9h10.5a5.5 5.5 0 0 1 0 11H11"],
  redo: ["M15 14l5-5-5-5", "M20 9H9.5a5.5 5.5 0 0 0 0 11H13"],
  download: ["M12 4v11", "M7 10l5 5 5-5", "M5 20h14"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 13h10l1-13"],
  eye: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  eraser: ["M15 4l5 5-10 10H6l-3-3z", "M9 19h12"],
  sparkle: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"],
} as const;

export type IconName = keyof typeof PATHS;

type Props = {
  name: IconName;
  size?: number;
  filled?: boolean;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ name, size = 20, filled, strokeWidth = 1.8, className }: Props) {
  return (
    <svg
      className={className ? `at-icon ${className}` : "at-icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
