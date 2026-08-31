"use client";

import { useFormatter } from "next-intl";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ThemePoint } from "@/data/schemas";

/**
 * Theme Detail trend-over-time graph (C2). Uses Recharts (the project's chart
 * lib) for the axis + tooltip a bare sparkline can't give. Only ever rendered
 * after its parent's client-side query resolves (the page shows a skeleton until
 * then), so `ResponsiveContainer` measures a real width client-side and never
 * participates in the SSR/hydration snapshot.
 */
export function ThemeTrendGraph({ series }: { series: readonly ThemePoint[] }) {
  const format = useFormatter();
  const gradientId = useId();

  const data = series.map((point) => {
    const [year, month] = point.period.split("-").map(Number);
    const label = format.dateTime(new Date(Date.UTC(year!, month! - 1, 1)), {
      month: "short",
    });
    return { label, count: point.count };
  });

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            allowDecimals={false}
            width={32}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              fontSize: 12,
              color: "var(--popover-foreground)",
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--primary)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 2, fill: "var(--primary)" }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
