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
      const dateString = String(incident.dateTime || '').replace(/\.$/g, '');
      if (!dateString) return acc;
      
      try {
        const date = new Date(dateString.replace(/\./g, '-'));
        if (isNaN(date.getTime())) {
          return acc;
        }

        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        if (!acc[key]) {
          acc[key] = { month: key, '사고 건수': 0 };
        }
        acc[key]['사고 건수']++;
      } catch (e) {
        // Ignore errors from invalid date formats
      }
      return acc;
    }, {} as Record<string, { month: string; '사고 건수': number }>);
    
    return Object.values(dataByMonth)
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [incidents]);

  return (
    <Card>
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>월별 사고 발생 현황</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }} className="h-[220px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (typeof value === 'string' && value.endsWith('-01')) {
                    return `'${value.substring(2, 4)}`;
                  }
                  return '';
                }}
                interval="preserveStartEnd"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                label={{ value: '사고 건수', angle: -90, position: 'insideLeft', offset: 10, fill: 'hsl(var(--muted-foreground))' }}
                domain={[0, 'auto']}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line type="monotone" dataKey="사고 건수" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
