"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/utils/date";

type Point = {
  date: string;
  weight: number;
  bodyFat: number;
  leanMass: number;
};

export function AnthropometryEvolutionChart({ points }: { points: Point[] }) {
  if (!points.length) {
    return <p className="text-sm text-slate-500">Sem avaliacoes suficientes para gerar grafico.</p>;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="date" tickFormatter={(value) => formatDate(value)} fontSize={12} />
          <YAxis yAxisId="left" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" fontSize={12} />
          <Tooltip labelFormatter={(value) => formatDate(String(value))} />
          <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={2} name="Peso (kg)" />
          <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} name="% Gordura" />
          <Line yAxisId="left" type="monotone" dataKey="leanMass" stroke="#334155" strokeWidth={2} name="Massa Magra (kg)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
