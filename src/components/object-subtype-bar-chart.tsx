'use client';

import { useMemo } from 'react';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ObjectSubtypeBarChartProps {
  incidents: Incident[];
}

export default function ObjectSubtypeBarChart({ incidents }: ObjectSubtypeBarChartProps) {
  const chartData = useMemo(() => {
    const dataByWorkType = incidents.reduce((acc, incident) => {
      const workType = incident.workType || '기타';
      acc[workType] = (acc[workType] || 0) + incident.riskIndex;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dataByWorkType)
      .map(([name, value]) => ({ name, '사고위험지수': parseFloat(value.toFixed(1)) }))
      .sort((a, b) => a['사고위험지수'] - b['사고위험지수']);
  }, [incidents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>작업별 사고위험지수</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ '사고위험지수': { label: '사고위험지수', color: 'hsl(var(--chart-3))' } }} className="h-[220px] w-full">
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
                tickFormatter={(value) => value.toLocaleString()}
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
              <Bar dataKey="사고위험지수" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
