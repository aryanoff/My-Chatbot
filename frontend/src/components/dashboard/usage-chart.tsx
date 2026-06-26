"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UsageChartProps {
  data: Array<{ date: string; tokens: number; messages: number }>;
}

export function UsageChart({ data }: UsageChartProps) {
  const chartData = data.length
    ? data
    : Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        tokens: Math.floor(Math.random() * 5000),
        messages: Math.floor(Math.random() * 50),
      }));

  return (
    <div className="glass-card h-80 p-6">
      <h3 className="mb-4 font-semibold">Token Usage</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }} />
          <Area type="monotone" dataKey="tokens" stroke="#6366F1" fill="url(#tokenGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
