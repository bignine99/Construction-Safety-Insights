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
import type { Incident } from '@/lib/types';
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
  incidents: Incident[];
}

function excelSerialDateToJSDate(serial: number): Date | null {
  if (typeof serial !== 'number' || isNaN(serial)) {
    return null;
  }
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;
  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds
  );
}

export default function MonthlyAccidentTrendChart({
  incidents,
}: MonthlyAccidentTrendChartProps) {
  const [activeTab, setActiveTab] = useState<'accidents' | 'fatalities'>(
    'accidents'
  );

  const chartData = useMemo(() => {
    const dataByMonth: {
      month: number;
      accidents: number;
      fatalities: number;
    }[] = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      accidents: 0,
      fatalities: 0,
    }));

    incidents.forEach((incident) => {
      let date: Date | null = null;
      const dateTimeValue = incident.dateTime;

      if (typeof dateTimeValue === 'number') {
        date = excelSerialDateToJSDate(dateTimeValue);
      } else if (typeof dateTimeValue === 'string' && dateTimeValue.length > 0) {
        try {
          date = new Date(
            String(dateTimeValue).replace(/\./g, '-').replace(/-$/, '')
          );
        } catch (e) {
          // Invalid date string format
        }
      }

      if (!date || isNaN(date.getTime())) {
        return;
      }

      const month = date.getMonth(); // 0-11
      dataByMonth[month].accidents++;
      dataByMonth[month].fatalities += incident.fatalities;
    });

    return dataByMonth.map((d) => ({
      ...d,
      name: `${d.month}월`,
    }));
  }, [incidents]);

  const maxAccidents = Math.max(...chartData.map((d) => d.accidents));
  const maxFatalities = Math.max(...chartData.map((d) => d.fatalities));

  return (
    <Card className="flex flex-col">
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
      <CardContent className="flex-grow p-2 pt-0">
        <ChartContainer
          config={{
            accidents: { label: '총 사고 건수', color: 'hsl(var(--primary))' },
            fatalities: { label: '사망자 수', color: 'hsl(var(--destructive))' },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer>
            <ComposedChart data={chartData}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={true}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: '총 사고 (건)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: 'hsl(var(--muted-foreground))',
                }}
                domain={[0, maxAccidents * 1.1]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: '사망자 (명)',
                  angle: -90,
                  position: 'insideRight',
                  offset: 10,
                  fill: 'hsl(var(--muted-foreground))',
                }}
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
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
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
