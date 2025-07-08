'use client';

import { Pie, PieChart as RechartsPieChart, Tooltip, Cell } from 'recharts';
import type { Incident } from '@/lib/types';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface ProjectTypePieChartProps {
  incidents: Incident[];
}

const chartConfig = {
  value: {
    label: '건수',
  },
  '업무시설': {
    label: '업무시설',
    color: 'hsl(var(--chart-1))',
  },
  '공동주택': {
    label: '공동주택',
    color: 'hsl(var(--chart-2))',
  },
  '공장': {
    label: '공장',
    color: 'hsl(var(--chart-3))',
  },
  '교육연구시설': {
    label: '교육연구시설',
    color: 'hsl(var(--chart-4))',
  },
  '판매시설': {
    label: '판매시설',
    color: 'hsl(var(--chart-5))',
  },
  '문화 및 집회시설': {
    label: '문화 및 집회시설',
    color: 'hsl(var(--chart-1))',
  },
  '기타': {
    label: '기타',
    color: 'hsl(var(--chart-2))',
  }
};

export default function ProjectTypePieChart({ incidents }: ProjectTypePieChartProps) {
  const data = Object.entries(
    incidents.reduce((acc, incident) => {
      acc[incident.projectType] = (acc[incident.projectType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const typedChartConfig = chartConfig as Record<string, {label: string, color: string}>;

  return (
    <ChartContainer config={typedChartConfig} className="h-[300px] w-full">
      <RechartsPieChart>
        <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={2}>
          {data.map(entry => (
            <Cell key={`cell-${entry.name}`} fill={typedChartConfig[entry.name]?.color || 'hsl(var(--muted))'} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"/>
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </RechartsPieChart>
    </ChartContainer>
  );
}
