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
    const dataByMonth = incidents.reduce((acc, incident) => {
      const month = incident.dateTime.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dataByMonth)
      .map(([month, count]) => ({ name: month, '사고 건수': count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [incidents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 사고 발생 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }} className="h-[350px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="name" 
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
