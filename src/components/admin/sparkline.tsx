"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type Props = {
  data: number[];
  color: string;
  height?: number;
};

// Sparkline rất gọn: không trục, không lưới, không tooltip.
// Skip SSR render của Recharts để tránh warning "width -1 height -1" khi
// container chưa có kích thước layout — chỉ mount sau hydration.
export function Sparkline({ data, color, height = 48 }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-full" style={{ height }} aria-hidden />;
  }

  const chartData = data.map((v, i) => ({ x: i, y: v }));
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2.25}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
