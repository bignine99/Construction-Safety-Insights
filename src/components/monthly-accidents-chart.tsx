'use client';

import { useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Incident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface MonthlyAccidentsChartProps {
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
  
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}


export default function MonthlyAccidentsChart({ incidents }: MonthlyAccidentsChartProps) {
  const chartData = useMemo(() => {
    const dataByMonth = incidents.reduce((acc, incident) => {
      let date: Date | null = null;
      const dateTimeValue = incident.dateTime;

      if (typeof dateTimeValue === 'number') {
        date = excelSerialDateToJSDate(dateTimeValue);
      } else if (typeof dateTimeValue === 'string' && dateTimeValue.length > 0) {
        try {
          date = new Date(String(dateTimeValue).replace(/\./g, '-').replace(/-$/, ''));
        } catch (e) {
          // Invalid date string format
        }
      }
      
      if (!date || isNaN(date.getTime())) {
        return acc;
      }

      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { month: key, '사고 건수': 0 };
      }
      acc[key]['사고 건수']++;

      return acc;
    }, {} as Record<string, { month: string; '사고 건수': number }>);
    
    return Object.values(dataByMonth)
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [incidents]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center p-4 pb-2">
        <CardTitle>월별 사고 발생 현황</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-2 pt-0">
        <ChartContainer config={{ '사고 건수': { label: '사고 건수', color: 'hsl(var(--primary))' } }} className="h-full w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={true} 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (typeof value === 'string') {
                    const year = value.substring(2, 4);
                    const month = value.substring(5, 7);
                    if (month === '01') {
                      return `${year}.${month}`;
                    }
                  }
                  return '';
                }}
                interval="preserveStartEnd"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                label={{ value: '사고 건수', angle: -90, position: 'insideLeft', offset: 10, fill: 'hsl(var(--muted-foreground))' }}
                domain={[0, 'auto']}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line type="monotone" dataKey="사고 건수" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
