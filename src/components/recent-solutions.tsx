// src/components/recent-solutions.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecentSolutionsAction } from '@/app/actions';
import type { SavedSolution } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, FileText, ChevronRight, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

export default function RecentSolutions() {
  const [solutions, setSolutions] = useState<SavedSolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSolutions() {
      setLoading(true);
      const data = await getRecentSolutionsAction(3); // 최근 3개만 표시
      setSolutions(data);
      setLoading(false);
    }
    fetchSolutions();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (solutions.length === 0) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-700 tracking-tight">최근 히스토리</h2>
        </div>
        <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold text-slate-400 border-slate-200">
          RECENT REPORTS
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {solutions.map((solution) => (
          <Dialog key={solution.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 rounded-2xl overflow-hidden group bg-white">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {formatDate(solution.createdAt)}
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">
                    {solution.title || `${solution.incidentCount}건 데이터 분석`}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-3 font-medium">
                    {solution.analysisResults[0]}
                  </p>
                  <div className="mt-auto flex items-center text-[10px] font-bold text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View Full Report <ChevronRight className="h-3 w-3 ml-0.5" />
                  </div>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] border-none shadow-2xl rounded-3xl overflow-hidden p-0">
              <div className="bg-slate-900 p-8 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-0.5 rounded bg-indigo-600 text-[10px] font-bold tracking-widest">SAVED ARCHIVE</div>
                    <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">| AI REPORT</span>
                  </div>
                  <DialogTitle className="text-2xl font-bold">{solution.title || 'AI 안전 분석 결과'}</DialogTitle>
                  <DialogDescription className="text-slate-400 font-medium">
                    분석 일시: {new Date(solution.createdAt).toLocaleString('ko-KR')} | 분석 대상: {solution.incidentCount}건의 사고 사례
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <ScrollArea className="p-8 max-h-[60vh]">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                      <h4 className="font-bold text-slate-900 text-sm">데이터 분석 결과</h4>
                    </div>
                    <ul className="space-y-3">
                      {solution.analysisResults.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="text-indigo-500 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                      <h4 className="font-bold text-slate-900 text-sm">재발 방지 대책</h4>
                    </div>
                    <ul className="space-y-3">
                      {solution.preventativeMeasures.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="text-emerald-500 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500 rounded-full" />
                      <h4 className="font-bold text-slate-900 text-sm">안전작업 지시사항</h4>
                    </div>
                    <ul className="space-y-3">
                      {solution.safetyInstructions.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </ScrollArea>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of Report • Confidential Safety Data</p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
