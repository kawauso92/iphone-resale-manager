"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";
import { DashboardProfitPoint } from "@/types";

type ProfitLineChartProps = {
  data: DashboardProfitPoint[];
};

export function ProfitLineChart({ data }: ProfitLineChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--text-secondary)"
            tickFormatter={(value) => `¥${Number(value).toLocaleString("ja-JP")}`}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Line type="monotone" dataKey="profit" stroke="var(--accent)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
