'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface ConstructionSubtypePieChartProps {
  incidents: Incident[];
}

export default function ConstructionSubtypePieChart({ incidents }: ConstructionSubtypePieChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const data = incidents.reduce((acc, incident) => {
      const subType = incident.constructionTypeSub || '기타';
      acc[subType] = (acc[subType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedData = Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topData = sortedData.slice(0, 5);
    const otherValue = sortedData.slice(5).reduce((sum, item) => sum + item.value, 0);

    const finalData = topData;
    if (otherValue > 0) {
      finalData.push({ name: '기타', value: otherValue });
    }

    const config = finalData.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    }, {} as any);

    config.value = { label: '건수' };

    return { chartData: finalData, chartConfig: config };
  }, [incidents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>공종 중분류별 사고 비율</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} strokeWidth={2}>
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color || 'hsl(var(--muted))'} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"/>
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
