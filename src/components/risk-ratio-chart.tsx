'use client';

import { useMemo } from 'react';
import {
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface RiskRatioChartProps {
  incidents: Incident[];
}

const TARGET_CONSTRUCTION_TYPES = ['가설공사', '철근콘크리트공사', '철골공사'];

export default function RiskRatioChart({ incidents }: RiskRatioChartProps) {
  const { percentage } = useMemo(() => {
    if (incidents.length === 0) {
      return { percentage: 0 };
    }

    const totalRiskIndex = incidents.reduce((sum, i) => sum + i.riskIndex, 0);

    const selectedIncidents = incidents.filter(i =>
      TARGET_CONSTRUCTION_TYPES.includes(i.constructionTypeSub)
    );

    const selectedRiskIndex = selectedIncidents.reduce(
      (sum, i) => sum + i.riskIndex,
      0
    );

    const ratio = totalRiskIndex > 0 ? selectedRiskIndex / totalRiskIndex : 0;

    return {
      percentage: ratio * 100,
    };
  }, [incidents]);

  const chartData = [{ name: 'ratio', value: percentage }];

  const chartConfig = {
    value: { label: '비율', color: 'hsl(var(--chart-2))' },
    ratio: { label: '비율', color: 'hsl(var(--chart-2))' },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>검색 공종 사고위험 비율</CardTitle>
        <CardDescription>전체 대비 상대적 위험도</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[250px]"
        >
          <ResponsiveContainer>
            <RadialBarChart
              data={chartData}
              startAngle={90}
              endAngle={-270}
              innerRadius="75%"
              outerRadius="90%"
            >
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={value => `${(value as number).toFixed(2)}%`}
                    label="선택 공종 위험 비율"
                  />
                }
              />
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                dataKey="value"
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                className="fill-primary"
              />
              <g>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-3xl font-bold"
                >
                  {`${percentage.toFixed(2)}%`}
                </text>
                <text
                  x="50%"
                  y="65%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-xs"
                >
                  (가설,철콘,철골)
                </text>
              </g>
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
