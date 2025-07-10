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

    let dataEntries = Object.entries(data).map(([name, value]) => ({ name, value }));

    const MAX_SLICES = 6;
    let finalData;

    if (dataEntries.length > MAX_SLICES) {
      dataEntries.sort((a, b) => b.value - a.value);

      const topData = dataEntries.slice(0, MAX_SLICES - 1);
      const otherData = dataEntries.slice(MAX_SLICES - 1);

      const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);
      const existingOther = topData.find(item => item.name === '기타');

      if (existingOther) {
        existingOther.value += otherValue;
        finalData = topData;
      } else {
        finalData = [...topData, { name: '기타', value: otherValue }];
      }
      finalData.sort((a, b) => b.value - a.value);
    } else {
      finalData = dataEntries;
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
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>중공종별 사고 비율</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer>
            <PieChart>
              <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} strokeWidth={2}>
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
