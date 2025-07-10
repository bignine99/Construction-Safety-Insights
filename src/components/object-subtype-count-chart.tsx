'use client';

import { useMemo } from 'react';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ObjectSubtypeCountChartProps {
  incidents: Incident[];
}

export default function ObjectSubtypeCountChart({ incidents }: ObjectSubtypeCountChartProps) {
  const chartData = useMemo(() => {
    const data = incidents.reduce((acc, incident) => {
      const subType = incident.objectSub || '기타';
      acc[subType] = (acc[subType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(data)
      .map(([name, value]) => ({ name, '사고 건수': value }))
      .sort((a, b) => b['사고 건수'] - a['사고 건수'])
      .slice(0, 9);
  }, [incidents]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>객체별 사고 건수</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0">
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--chart-2))' } }} className="h-full w-full">
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
                allowDecimals={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                width={80}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent indicator="line" hideLabel />}
              />
              <Bar dataKey="사고 건수" radius={[0, 4, 4, 0]}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--muted-foreground)/30)'} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
