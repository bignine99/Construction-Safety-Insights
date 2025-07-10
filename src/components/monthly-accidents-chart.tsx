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
      try {
        const date = new Date(incident.dateTime);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        // Create a key like "2023-01" for sorting and grouping
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        if (!acc[key]) {
          acc[key] = { month: key, '사고 건수': 0 };
        }
        acc[key]['사고 건수']++;
      } catch (e) {
        // Ignore incidents with invalid date
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
                  if (typeof value === 'string') {
                    // Show label only for January, format as 'YY-01
                    if (value.endsWith('-01')) {
                      return value.substring(2);
                    }
                    // Show a marker for other months for better spacing
                    if (['04', '07', '10'].some(m => value.endsWith(`-${m}`))) {
                        return '·';
                    }
                  }
                  return '';
                }}
                interval="preserveStartEnd"
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
