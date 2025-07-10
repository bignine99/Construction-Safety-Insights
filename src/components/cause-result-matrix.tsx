'use client';

import React, { useMemo } from 'react';
import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  Cell,
  ZAxis,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface CauseResultMatrixProps {
  incidents: Incident[];
}

const CAUSE_ORDER: string[] = ['시공오류', '기타', '설계오류'];
const RESULT_ORDER: { key: string; label: string }[] = [
  { key: '끼임', label: '끼임' },
  { key: '넘어짐', label: '넘어짐' },
  { key: '떨어짐', label: '떨어짐' },
  { key: '부딪힘', label: '부딪힘' },
  { key: '물체에맞음', label: '물체에맞음' },
  { key: '절단베임', label: '베임' },
  { key: '기타', label: '기타' },
];

export default function CauseResultMatrix({ incidents }: CauseResultMatrixProps) {
  const { chartData, maxCount } = useMemo(() => {
    const matrix: { cause: string; result: string; count: number }[] = [];
    const causeIndexMap = new Map(CAUSE_ORDER.map((c, i) => [c, i]));
    const resultIndexMap = new Map(RESULT_ORDER.map((r, i) => [r.key, i]));
    const resultLabelMap = new Map(RESULT_ORDER.map(r => [r.key, r.label]));
    let maxCount = 0;

    for (const incident of incidents) {
      const cause = CAUSE_ORDER.includes(incident.causeMain)
        ? incident.causeMain
        : '기타';
      const resultKey = RESULT_ORDER.find(r => r.key === incident.resultMain)?.key;

      if (resultKey) {
        let existingEntry = matrix.find(
          (d) => d.cause === cause && d.result === resultKey
        );
        if (existingEntry) {
          existingEntry.count++;
        } else {
          existingEntry = { cause, result: resultKey, count: 1 };
          matrix.push(existingEntry);
        }
        if (existingEntry.count > maxCount) {
          maxCount = existingEntry.count;
        }
      }
    }

    const data = matrix.map(item => ({
      ...item,
      x: causeIndexMap.get(item.cause),
      y: resultIndexMap.get(item.result),
      z: item.count,
      resultLabel: resultLabelMap.get(item.result),
    }));
    
    return { chartData: data, maxCount };
  }, [incidents]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>사고원인-결과 인과관계</CardTitle>
        <CardDescription className="text-xs">주요 사고 원인에 따른 결과 분포</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0">
        <ChartContainer config={{}} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
                margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
                }}
            >
                <XAxis
                dataKey="x"
                type="number"
                name="사고원인"
                domain={[-0.5, CAUSE_ORDER.length - 0.5]}
                ticks={CAUSE_ORDER.map((_, i) => i)}
                tickFormatter={(tick) => CAUSE_ORDER[tick]}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                />
                <YAxis
                dataKey="y"
                type="number"
                name="사고결과"
                domain={[-0.5, RESULT_ORDER.length - 0.5]}
                ticks={RESULT_ORDER.map((_, i) => i)}
                tickFormatter={(tick) => RESULT_ORDER[tick]?.label || ''}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={60}
                />
                <ZAxis dataKey="z" type="number" range={[100, 1000]} domain={[0, maxCount]} />
                <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent 
                    formatter={(value, name, props) => {
                    if (props.payload) {
                        const { cause, resultLabel, count } = props.payload;
                        return (
                        <div className="flex flex-col">
                            <span>{`${cause} > ${resultLabel}`}</span>
                            <span>{`${count} 건`}</span>
                        </div>
                        )
                    }
                    return null
                    }}
                    hideLabel
                />}
                />
                <Scatter name="사고" data={chartData} fill="hsl(var(--primary))" opacity={0.6}>
                </Scatter>
            </ScatterChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
