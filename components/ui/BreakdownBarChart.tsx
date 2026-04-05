"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

type BreakdownBarChartProps = {
  data: Array<{ label: string; value: number }>;
};

export function BreakdownBarChart({ data }: BreakdownBarChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--text-secondary)"
            tickFormatter={(value) => `¥${Number(value).toLocaleString("ja-JP")}`}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="var(--text-secondary)"
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Bar dataKey="value" fill="var(--accent)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
