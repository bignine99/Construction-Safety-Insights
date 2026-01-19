'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import type { DashboardStats } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

interface MonthlyAccidentTrendChartProps {
  stats: DashboardStats | null;
}

export default function MonthlyAccidentTrendChart({
  stats,
}: MonthlyAccidentTrendChartProps) {
  const [activeTab, setActiveTab] = useState<'accidents' | 'fatalities'>(
    'accidents'
  );

  const chartData = useMemo(() => {
    if (!stats) return [];
    
    return stats.monthlyTrend.map(d => ({
      ...d,
      name: `${d.month}월`,
    }));
  }, [stats]);

  const maxAccidents = useMemo(() => Math.max(...chartData.map((d) => d.accidents), 0), [chartData]);
  const maxFatalities = useMemo(() => Math.max(...chartData.map((d) => d.fatalities), 0), [chartData]);

  if (!stats) return null;

  return (
    <Card className="flex flex-col h-[350px]">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle>월별 사고 발생 추이</CardTitle>
        <div className="flex items-center gap-2 rounded-md bg-muted p-1 text-sm">
          <Button
            variant={activeTab === 'accidents' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('accidents')}
            className="h-8 px-3"
          >
            총 사고
          </Button>
          <Button
            variant={activeTab === 'fatalities' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('fatalities')}
            className="h-8 px-3"
          >
            사망자
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0 min-h-0">
        <ChartContainer
          config={{
            accidents: { label: '총 사고 건수', color: 'hsl(var(--primary))' },
            fatalities: { label: '사망자 수', color: 'hsl(var(--destructive))' },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={true}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={[0, maxAccidents * 1.1]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={[0, maxFatalities * 1.1]}
              />
              <Tooltip
                content={<ChartTooltipContent
                  formatter={(value, name, props) => {
                    if (props.dataKey === 'accidents') return `${Number(value).toLocaleString()}건`
                    if (props.dataKey === 'fatalities') return `${Number(value).toLocaleString()}명`
                    return String(value);
                  }}
                  indicator="dot"
                />}
              />
              <Bar
                yAxisId="left"
                dataKey="accidents"
                fill="hsl(var(--primary) / 0.5)"
                name="총 사고 건수"
                hide={activeTab === 'fatalities'}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fatalities"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="사망자 수"
                hide={activeTab === 'accidents'}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
