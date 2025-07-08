'use client';

import { useMemo } from 'react';
import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';


interface CauseResultMatrixProps {
  incidents: Incident[];
}

const CAUSE_ORDER = ['시공오류', '설계오류', '기타'];

export default function CauseResultMatrix({ incidents }: CauseResultMatrixProps) {
  const { chartData, resultTypes, chartConfig } = useMemo(() => {
    const data: Record<string, Record<string, any>> = {};
    const resultSet = new Set<string>();

    for (const cause of CAUSE_ORDER) {
      data[cause] = { name: cause };
    }

    for (const incident of incidents) {
      const cause = CAUSE_ORDER.includes(incident.causeMain)
        ? incident.causeMain
        : '기타';
      const result = incident.resultMain || '분류불능';
      
      resultSet.add(result);

      if (!data[cause][result]) {
        data[cause][result] = 0;
      }
      data[cause][result]++;
    }

    const resultTypes = Array.from(resultSet).sort();
    const chartData = Object.values(data);
    
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    const config = resultTypes.reduce((acc, result, index) => {
        acc[result] = {
            label: result,
            color: colors[index % colors.length],
        };
        return acc;
    }, {} as any);

    return { chartData, resultTypes, chartConfig: config };
  }, [incidents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>사고원인-결과 인과관계</CardTitle>
        <CardDescription>주요 사고 원인에 따른 결과 분포</CardDescription>
      </CardHeader>
      <CardContent className="pl-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ left: 10, right: 10, top: 20, bottom: 20 }}
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
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              {resultTypes.map((result) => (
                <Bar
                  key={result}
                  dataKey={result}
                  stackId="a"
                  fill={chartConfig[result]?.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
