'use client';

import type { Incident } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
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

export default function FilteredIncidentsTable({ incidents }: FilteredIncidentsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>DB</CardTitle>
          <CardDescription>필터링된 사고 데이터 목록입니다.</CardDescription>
        </div>
        <Badge variant="outline" className="text-base">
          총 {incidents.length.toLocaleString()}건
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
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
                    <TableCell>{incident.dateTime}</TableCell>
                    <TableCell>{incident.objectMain}</TableCell>
                    <TableCell>{incident.causeMain}</TableCell>
                    <TableCell>{incident.resultMain}</TableCell>
                    <TableCell className="text-right">{incident.riskIndex.toFixed(2)}</TableCell>
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
