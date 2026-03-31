"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface EvaluationRadarChartProps {
  evaluations: {
    punctuality: number;
    organization: number;
    knowledge: number;
    proactivity: number;
    commitment: number;
    createdAt: Date;
  }[];
}

export default function EvaluationRadarChart({ evaluations }: EvaluationRadarChartProps) {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400">Nenhuma avaliação registrada ainda.</p>
      </div>
    );
  }

  // Pegar a mais recente para o radar chart básico, ou criar uma média de todas
  const latest = evaluations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const data = [
    {
      subject: "Pontualidade",
      A: latest.punctuality,
      fullMark: 5,
    },
    {
      subject: "Organização",
      A: latest.organization,
      fullMark: 5,
    },
    {
      subject: "Conhecimento",
      A: latest.knowledge,
      fullMark: 5,
    },
    {
      subject: "Proatividade",
      A: latest.proactivity,
      fullMark: 5,
    },
    {
      subject: "Comprometimento",
      A: latest.commitment,
      fullMark: 5,
    },
  ];

  return (
    <div className="h-80 w-full bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm">
      <h3 className="text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Desempenho Atual (Radar)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#9ca3af' }} />
          <Radar
            name="Nota"
            dataKey="A"
            stroke="#1B3A5C"
            fill="#F5A623"
            fillOpacity={0.6}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
