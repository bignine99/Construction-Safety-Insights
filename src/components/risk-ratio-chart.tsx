
'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  ZAxis,
  Cell,
  Label,
} from 'recharts';
import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer } from './ui/chart';

interface RiskRatioChartProps {
  incidents: Incident[];
  constructionTypeMap: Record<string, string[]>;
  activeFilters: string[];
}

interface BubbleData {
  x: number;
  y: number;
  z: number; // size
  name: string;
  mainType: string;
  fill: string;
  isActive: boolean;
}

const MAIN_TYPE_POSITIONS: Record<
  string,
  { x: number; y: number; color: string; radius: number }
> = {
  건축: { x: 0.35, y: 0.35, color: 'hsl(var(--chart-1))', radius: 0.22 },
  토목: { x: 0.75, y: 0.35, color: 'hsl(var(--chart-2))', radius: 0.13 },
  설비: { x: 0.35, y: 0.75, color: 'hsl(var(--chart-3))', radius: 0.13 },
  기타: { x: 0.75, y: 0.75, color: 'hsl(var(--chart-5))', radius: 0.13 },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              중분류
            </span>
            <span className="font-bold text-muted-foreground">{data.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              사고 건수
            </span>
            <span className="font-bold">{data.z}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function RiskRatioChart({
  incidents,
  constructionTypeMap,
  activeFilters,
}: RiskRatioChartProps) {
  const { bubbleData, maxCount } = useMemo(() => {
    const subTypeCounts = incidents.reduce((acc, incident) => {
      const subType = incident.constructionTypeSub;
      if (subType) {
        acc[subType] = (acc[subType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    let data: BubbleData[] = [];
    const currentMaxCount = Math.max(...Object.values(subTypeCounts), 0);

    Object.entries(constructionTypeMap).forEach(([mainType, subTypes]) => {
      const center = MAIN_TYPE_POSITIONS[mainType];
      if (!center) return;

      const angleStep = (2 * Math.PI) / (subTypes.length || 1);

      subTypes.forEach((subType, i) => {
        const count = subTypeCounts[subType] || 0;
        if (count === 0) return;

        const angle = angleStep * i;
        const x = center.x + center.radius * Math.cos(angle);
        const y = center.y + center.radius * Math.sin(angle) * 0.8; // Make it more oval

        data.push({
          x: x,
          y: y,
          z: count,
          name: subType,
          mainType: mainType,
          fill: center.color,
          isActive: activeFilters.includes(subType),
        });
      });
    });

    return { bubbleData: data, maxCount: currentMaxCount };
  }, [incidents, constructionTypeMap, activeFilters]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>공종별 사고 분포</CardTitle>
        <CardDescription className="text-xs">
          대분류(클러스터)와 중분류(버블) 사고 분포
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ChartContainer config={{}} className="w-full h-full min-h-[250px]">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 30, right: 30, bottom: 20, left: 30 }}>
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 1]}
                tick={false}
                axisLine={false}
                hide
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 1]}
                tick={false}
                axisLine={false}
                hide
              />
              <ZAxis
                type="number"
                dataKey="z"
                range={[500, 10000]}
                domain={[0, maxCount > 0 ? maxCount : 1]}
              />

              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<CustomTooltip />}
              />

              <Scatter data={bubbleData} isAnimationActive={false}>
                {bubbleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke={
                      entry.isActive
                        ? 'hsl(var(--primary-foreground))'
                        : 'hsl(var(--primary))'
                    }
                    strokeWidth={entry.isActive ? 3 : 1}
                    style={{ opacity: entry.isActive ? 1 : 0.6 }}
                  />
                ))}
              </Scatter>

              {Object.entries(MAIN_TYPE_POSITIONS).map(([name, { x, y }]) => (
                <Scatter
                  key={name}
                  data={[{x, y}]}
                  isAnimationActive={false}
                  shape={() => null} // Render nothing for the scatter point itself
                >
                  <Label
                    value={name}
                    position="center"
                    fill="hsl(var(--foreground))"
                    fontSize={14}
                    fontWeight="bold"
                  />
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
