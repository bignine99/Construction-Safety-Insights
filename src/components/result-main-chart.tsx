'use client';

import { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ResultMainChartProps {
  incidents: Incident[];
}

export default function ResultMainChart({ incidents }: ResultMainChartProps) {
  const chartData = useMemo(() => {
    const data = incidents.reduce((acc, incident) => {
      const result = incident.resultMain || '기타';
      acc[result] = (acc[result] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Order from image, starting top and going clockwise
    const categories: {key: string, label: string}[] = [
      { key: '끼임', label: '끼임' },
      { key: '물체에맞음', label: '물체에맞음' },
      { key: '넘어짐', label: '넘어짐' },
      { key: '기타', label: '기타' },
      { key: '떨어짐', label: '떨어짐' },
      { key: '절단베임', label: '베임' },
      { key: '부딪힘', label: '부딪힘' },
    ];
    
    return categories.map(category => ({
      name: category.label,
      '사고 건수': data[category.key] || 0,
    }));
  }, [incidents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>사고 결과 대분류별 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }}
          className="h-[350px] w-full"
        >
          <ResponsiveContainer>
            <RadarChart data={chartData}>
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Radar
                name="사고 건수"
                dataKey="사고 건수"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
