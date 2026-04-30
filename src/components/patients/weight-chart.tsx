"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/utils/date";

type WeightPoint = {
  date: string;
  weight: number;
};

export function WeightChart({ points }: { points: WeightPoint[] }) {
  if (!points.length) {
    return <p className="text-sm text-slate-500">Sem dados suficientes para gráfico de evolução.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="date" tickFormatter={(value) => formatDate(value)} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip labelFormatter={(value) => formatDate(String(value))} />
          <Line dataKey="weight" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
