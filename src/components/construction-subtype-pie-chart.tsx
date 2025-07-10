// src/components/construction-subtype-pie-chart.tsx
'use client';

import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ConstructionSubtypeTreemapProps {
  incidents: Incident[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Custom content component to render inside each treemap rectangle
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, value } = props;

  // Don't render labels on the root node or if the box is too small
  if (depth < 1 || width < 30 || height < 20) {
    return null;
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        className="text-[10px] font-normal antialiased"
      >
        {name}
      </text>
       <text
        x={x + width / 2}
        y={y + height / 2 + 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        className="text-[10px] font-normal antialiased"
      >
        {`(${value}건)`}
      </text>
    </g>
  );
};


export default function ConstructionSubtypeTreemap({ incidents }: ConstructionSubtypeTreemapProps) {
  const chartData = useMemo(() => {
    const data = incidents.reduce((acc, incident) => {
      const subType = incident.constructionTypeSub || '기타';
      acc[subType] = (acc[subType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [incidents]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>중공종별 사고 비율</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0">
        <ChartContainer config={{}} className="h-full w-full">
          <ResponsiveContainer>
              <Treemap
                  data={chartData}
                  dataKey="value"
                  stroke="#fff"
                  fill="hsl(var(--primary))"
                  content={<CustomizedContent />}
                  aspectRatio={4 / 3}
              >
                  <Tooltip 
                      content={<ChartTooltipContent 
                          formatter={(value, name) => `${(value as number).toLocaleString()}건`}
                          labelFormatter={(label) => `중공종: ${label}`}
                          indicator="dot"
                      />} 
                  />
              </Treemap>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
