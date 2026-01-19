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
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ClipboardCheck, 
  FileSearch 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilteredIncidentsTableProps {
  incidents: Incident[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

// Helper function to convert Excel serial date to a readable string format
function formatDateTime(dateTimeValue: string | number): string {
  if (!dateTimeValue) {
    return '';
  }

  let date: Date | null = null;
  
  if (typeof dateTimeValue === 'number') {
      const utc_days = Math.floor(dateTimeValue - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  } else if (typeof dateTimeValue === 'string' && dateTimeValue.trim().length > 0) {
      try {
          const dateString = String(dateTimeValue).replace(/\./g, '-').replace(/-$/, '');
          if (dateString) {
            date = new Date(dateString);
          }
      } catch (e) {
          return dateTimeValue;
      }
  }

  if (date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
  }
  
  return String(dateTimeValue);
}

export default function FilteredIncidentsTable({ 
  incidents, 
  totalCount, 
  page, 
  pageSize, 
  onPageChange,
  isLoading 
}: FilteredIncidentsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card className={cn(
      "border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white transition-all",
      isLoading && "opacity-60 grayscale-[0.5]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">사고 데이터 상세 명세</CardTitle>
            <p className="text-xs text-slate-500 font-medium">필터링된 건설 안전사고 원천 데이터 목록</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Records</span>
            <span className="text-sm font-bold text-slate-900">{totalCount.toLocaleString()}건</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900"
              onClick={() => onPageChange(1)}
              disabled={page === 1 || isLoading}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 py-1 bg-slate-50 rounded text-[11px] font-bold text-slate-600 min-w-[60px] text-center border border-slate-100">
              {page} / {totalPages || 1}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || totalPages === 0 || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages || totalPages === 0 || isLoading}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">No.</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">사고명 (사고 개요)</TableHead>
                <TableHead className="w-[120px] text-[11px] font-bold text-slate-400 uppercase tracking-wider">사고일시</TableHead>
                <TableHead className="w-[120px] text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">사고객체</TableHead>
                <TableHead className="w-[120px] text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">사고원인</TableHead>
                <TableHead className="w-[120px] text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center text-rose-500">위험지수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length > 0 ? (
                incidents.map((incident, index) => (
                  <TableRow key={incident.id} className="group hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-center font-mono text-[11px] text-slate-400">
                      {((page - 1) * pageSize + index + 1).toString().padStart(4, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800 text-[13px] group-hover:text-indigo-600 transition-colors truncate max-w-md" title={incident.name}>
                          {incident.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">공종: {incident.constructionTypeSub}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] font-medium text-slate-600">{formatDateTime(incident.dateTime)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 rounded-md text-[10px] font-semibold">
                        {incident.objectMain}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-indigo-50/50 text-indigo-600 border-indigo-100 rounded-md text-[10px] font-semibold">
                        {incident.causeMain}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${Math.min(incident.riskIndex * 100, 100)}%` }} 
                          />
                        </div>
                        <span className="text-[12px] font-bold text-slate-700 min-w-[24px]">
                          {(incident.riskIndex * 10).toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSearch className="w-8 h-8 text-slate-200" />
                      <p className="text-sm font-medium text-slate-400">
                        {isLoading ? '데이터를 로딩 중입니다...' : '표시할 데이터가 없습니다.'}
                      </p>
                    </div>
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
