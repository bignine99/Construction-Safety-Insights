'use client';

import { useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface MonthlyAccidentsChartProps {
  incidents: Incident[];
}

export default function MonthlyAccidentsChart({ incidents }: MonthlyAccidentsChartProps) {
  const chartData = useMemo(() => {
    const dataByYear = incidents.reduce((acc, incident) => {
      const year = new Date(incident.dateTime).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = { year, '사고 건수': 0 };
      }
      acc[year]['사고 건수']++;
      return acc;
    }, {} as Record<string, { year: string; '사고 건수': number }>);
    
    return Object.values(dataByYear)
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [incidents]);

  return (
    <Card>
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>년도별 사고 발생 현황</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }} className="h-[220px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="year" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                label={{ value: '사고 건수', angle: -90, position: 'insideLeft', offset: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line type="monotone" dataKey="사고 건수" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
