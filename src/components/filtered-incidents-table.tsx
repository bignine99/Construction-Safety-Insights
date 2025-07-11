'use client';

import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface FilteredIncidentsTableProps {
  incidents: Incident[];
}

// Helper function to convert Excel serial date to a readable string format
function formatDateTime(dateTimeValue: string | number): string {
  if (!dateTimeValue) {
    return '';
  }

  let date: Date | null = null;
  
  if (typeof dateTimeValue === 'number') {
      // Excel serial date to JS Date conversion
      const utc_days = Math.floor(dateTimeValue - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  } else if (typeof dateTimeValue === 'string' && dateTimeValue.trim().length > 0) {
      try {
          // Handles formats like "2023.12.31."
          const dateString = String(dateTimeValue).replace(/\./g, '-').replace(/-$/, '');
          if (dateString) {
            date = new Date(dateString);
          }
      } catch (e) {
          return dateTimeValue; // Return original string if parsing fails
      }
  }

  if (date && !isNaN(date.getTime())) {
      // Format to YYYY-MM-DD
      return date.toISOString().split('T')[0];
  }
  
  // Return original value or a placeholder if conversion fails
  return String(dateTimeValue);
}

export default function FilteredIncidentsTable({ incidents }: FilteredIncidentsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-primary">필터링된 사고 데이터 목록</CardTitle>
        </div>
        <Badge variant="outline" className="text-base">
          총 {incidents.length.toLocaleString()}건
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>사고명</TableHead>
                <TableHead className="w-[120px]">사고일시</TableHead>
                <TableHead className="w-[150px]">사고객체</TableHead>
                <TableHead className="w-[150px]">사고원인</TableHead>
                <TableHead className="w-[150px]">사고결과</TableHead>
                <TableHead className="w-[120px] text-right">사고위험지수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length > 0 ? (
                incidents.map((incident, index) => (
                  <TableRow key={incident.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium truncate max-w-xs">{incident.name}</TableCell>
                    <TableCell>{formatDateTime(incident.dateTime)}</TableCell>
                    <TableCell>{incident.objectMain}</TableCell>
                    <TableCell>{incident.causeMain}</TableCell>
                    <TableCell>{incident.resultMain}</TableCell>
                    <TableCell className="text-right">{(incident.riskIndex * 10).toFixed(1)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    표시할 데이터가 없습니다. 필터를 조정해 주세요.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
