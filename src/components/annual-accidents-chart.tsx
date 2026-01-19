'use client';

import { useMemo } from 'react';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface AnnualAccidentsChartProps {
  stats: DashboardStats | null;
}

export default function AnnualAccidentsChart({ stats }: AnnualAccidentsChartProps) {
  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.annualData.map(d => ({ year: d.year, '사고 건수': d.count }));
  }, [stats]);
  
  const allYears = useMemo(() => {
    const startYear = 2019;
    const years = [];
    for (let y = startYear; y <= 2024; y++) {
      years.push(y.toString());
    }
    return years;
  }, []);
  
  const fullChartData = useMemo(() => {
    return allYears.map(yearStr => {
      const found = chartData.find(d => d.year === yearStr);
      return { year: yearStr, '사고 건수': found ? found['사고 건수'] : 0 };
    });
  }, [allYears, chartData]);

  if (!stats) return null;

  return (
    <Card className="flex flex-col h-[350px]">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>년도별 사고 발생 현황</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0 min-h-0">
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={fullChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5, }}
              accessibilityLayer
            >
              <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="사고 건수" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
