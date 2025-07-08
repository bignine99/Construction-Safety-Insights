'use client';

import { Bar, BarChart as RechartsBarChart, YAxis, Tooltip } from 'recharts';
import type { Incident } from '@/lib/types';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface CauseBarChartProps {
  incidents: Incident[];
}

export default function CauseBarChart({ incidents }: CauseBarChartProps) {
  const data = Object.entries(
    incidents.reduce((acc, incident) => {
      acc[incident.causeMain] = (acc[incident.causeMain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.value - b.value);

  return (
    <ChartContainer config={{}} className="h-[300px] w-full">
      <RechartsBarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={100}
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </RechartsBarChart>
    </ChartContainer>
  );
}
