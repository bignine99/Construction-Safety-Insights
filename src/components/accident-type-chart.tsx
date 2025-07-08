'use client';

import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface AccidentTypeChartProps {
  incidents: Incident[];
}

export default function AccidentTypeChart({ incidents }: AccidentTypeChartProps) {
  const data = Object.entries(
    incidents.reduce((acc, incident) => {
      const result = incident.resultMain || '기타';
      acc[result] = (acc[result] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, '사고 건수': value }))
    .sort((a, b) => b['사고 건수'] - a['사고 건수'])
    .slice(0, 9)
    .sort((a, b) => a['사고 건수'] - b['사고 건수']); // Sort ascending for horizontal display

  return (
    <Card>
      <CardHeader>
        <CardTitle>주요 발생 형태별 현황 (Top 9)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }} className="h-[400px] w-full">
          <RechartsBarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 10, right: 30, top: 5, bottom: 20 }}
            accessibilityLayer
          >
            <XAxis 
              type="number" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
              label={{ value: '사고 건수', position: 'insideBottom', offset: 0, fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 'dataMax']}
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
            <Bar dataKey="사고 건수" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
