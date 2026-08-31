import { cn } from "@/lib/utils";

/**
 * A tiny inline trend sparkline for theme cards (design direction: "Theme card =
 * … + sparkline"). Hand-rolled SVG rather than Recharts: at 6 points in a
 * 96×28 box a full chart engine is overkill, and a plain polyline stays crisp
 * and dependency-light. The richer axis+tooltip trend graph on the Theme Detail
 * page uses Recharts instead (see {@link ThemeTrendGraph}).
 *
 * Colour comes from the current text colour, so callers tint via `className`.
 */
export function Sparkline({
  data,
  className,
  width = 96,
  height = 28,
}: {
  data: readonly number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  if (data.length === 0) return null;

  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const denom = Math.max(1, data.length - 1);

  const coords = data.map((value, index) => {
    const x = pad + (index / denom) * (width - pad * 2);
    const y = pad + (1 - (value - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const points = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const last = coords[coords.length - 1]!;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-primary", className)}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r={2} fill="currentColor" />
    </svg>
  );
}
