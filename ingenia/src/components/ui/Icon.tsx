/** Íconos SVG propios (trazo de 1.8 px, 24×24). Sin librerías externas. */
const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14",
  book: "M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zm0 15A1.5 1.5 0 0 0 5.5 21H20",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  flask: "M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10",
  exam: "M8 3h8l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm0 9 2.5 2.5L16 9",
  refresh: "M20 11A8 8 0 0 0 5.6 6.4L4 8m0-4v4h4M4 13a8 8 0 0 0 14.4 4.6L20 16m0 4v-4h-4",
  chat: "M4 5h16v11H9l-5 4z",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H3",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zm0 2H4a3 3 0 0 0 4 3m8-3h4a3 3 0 0 1-4 3m-4 4v4m-4 3h8",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-3 2-1-2-4-2.2.6a7 7 0 0 0-1.6-.9L15.5 4h-4l-.7 2.7a7 7 0 0 0-1.6.9L7 7l-2 4 2 1v1l-2 1 2 4 2.2-.6a7 7 0 0 0 1.6.9l.7 2.7h4l.7-2.7a7 7 0 0 0 1.6-.9L18 18l2-4-2-1z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 3-4.3-4.3",
  flame: "M12 21c-4 0-7-2.7-7-6.5 0-3.2 2.2-5.4 4-7.5.4 2 1.6 3.2 3 3.5C11.5 7 13 4.5 15 3c.5 3 4 5.5 4 10.5 0 4-3 7.5-7 7.5z",
  star: "m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5 6.5 20.4l1-6.3L3 9.7l6.2-.9z",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  bolt: "M13 3 5 13h6l-1 8 8-10h-6z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-15v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6 6 18",
  bulb: "M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z",
  arrowRight: "M5 12h14m-6-6 6 6-6 6",
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  play: "M7 4v16l13-8z",
  lock: "M6 11h12v10H6zm2 0V8a4 4 0 0 1 8 0v3",
  sigma: "M18 4H6l6 8-6 8h12",
  menu: "M4 6h16M4 12h16M4 18h16",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v5l3 2",
  alert: "M12 3 2 20h20zm0 6v5m0 3v.5",
  sparkle: "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  formula: "M5 4h6M8 4v16m-3 0h6m4-12 5 8m0-8-5 8",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className = "", label }: { name: IconName; size?: number; className?: string; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
