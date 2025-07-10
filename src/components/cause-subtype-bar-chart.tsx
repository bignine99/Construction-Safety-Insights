'use client';

import { useMemo } from 'react';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface CauseSubtypeBarChartProps {
  incidents: Incident[];
}

export default function CauseSubtypeBarChart({ incidents }: CauseSubtypeBarChartProps) {
  const chartData = useMemo(() => {
    const data = incidents.reduce((acc, incident) => {
      const subType = incident.causeMiddle || '기타';
      acc[subType] = (acc[subType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(data)
      .map(([name, value]) => ({ name, '사고 건수': value }))
      .sort((a, b) => b['사고 건수'] - a['사고 건수'])
      .slice(0, 9)
      .sort((a, b) => a['사고 건수'] - b['사고 건수']);
  }, [incidents]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>사고 원인별 사고 건수</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0">
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }} className="h-full w-full">
          <ResponsiveContainer>
            <RechartsBarChart 
              data={chartData} 
              layout="vertical" 
              margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
              accessibilityLayer
            >
              <XAxis 
                type="number" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
                domain={[0, 'dataMax']}
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                width={100}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent indicator="line" hideLabel />}
              />
              <Bar dataKey="사고 건수" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
