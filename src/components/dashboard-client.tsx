// src/components/dashboard-client.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { DashboardStats } from '@/lib/types';
import type { IncidentFilters } from '@/services/incident.service';
import { getDashboardStats, getFilterOptions } from '@/app/actions';
import FilterSidebar from '@/components/filter-sidebar';
import DashboardMetrics from '@/components/dashboard-metrics';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import PageHeader from './page-header';
import AnnualAccidentsChart from './annual-accidents-chart';
import ConstructionSubtypeTreemap from './construction-subtype-pie-chart';
import ObjectSubtypeBarChart from './object-subtype-bar-chart';
import ObjectSubtypeCountChart from './object-subtype-count-chart';
import CauseSubtypeBarChart from './cause-subtype-bar-chart';
import ResultMainChart from './result-main-chart';
import CauseResultMatrix from './cause-result-matrix';
import RiskRatioChart from './risk-ratio-chart';
import { DashboardNav } from './dashboard-nav';
import MonthlyAccidentTrendChart from './monthly-accident-trend-chart';
import { Skeleton } from './ui/skeleton';
import RecentSolutions from './recent-solutions';

const constructionTypeMap: Record<string, string[]> = {
  건축: [
    '해체및철거공사', '금속공사', '목공사', '수장공사', '도장공사',
    '지붕및홈통공사', '가설공사', '철근콘크리트공사', '철골공사', '조적공사',
    '미장공사', '방수공사', '타일및석공사', '창호및유리공사',
  ],
  토목: [
    '토공사', '지정공사', '관공사', '부대공사', '조경공사', '도로및포장공사',
  ],
  설비: ['기계설비공사', '전기설비공사', '통신설비공사'],
  기타: ['기타'],
};

function FullPageLoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6 pt-2">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  
  const [filters, setFilters] = useState<IncidentFilters>({
    projectOwner: [], projectType: [], constructionTypeMain: [],
    constructionTypeSub: [], objectMain: [], causeMain: [], resultMain: [],
  });

  // 모든 데이터 초기 로드 (옵션 + 통계)
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setIsStatsLoading(true);
      try {
        // 필터 옵션과 초기 통계를 병렬로 로드
        const [options, initialStats] = await Promise.all([
          getFilterOptions(),
          getDashboardStats(filters)
        ]);
        setFilterOptions(options);
        setStats(initialStats);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
        setIsStatsLoading(false);
      }
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 최초 1회만 실행

  // 필터 변경 시 통계만 업데이트
  useEffect(() => {
    // 최초 마운트 시에는 위 useEffect에서 처리하므로 스킵
    if (isLoading) return;

    async function updateStats() {
      setIsStatsLoading(true);
      try {
        const newStats = await getDashboardStats(filters);
        setStats(newStats);
      } catch (error) {
        console.error('Failed to update stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    }
    updateStats();
  }, [filters]);

  const constructionTypeSubOptions = useMemo(() => {
    if (!filters.constructionTypeMain || filters.constructionTypeMain.length === 0) {
      return filterOptions?.constructionTypeSubs || [];
    }
    const options = new Set<string>();
    filters.constructionTypeMain.forEach(mainType => {
      const subs = constructionTypeMap[mainType] || [];
      subs.forEach(sub => options.add(sub));
    });
    return Array.from(options);
  }, [filters.constructionTypeMain, filterOptions]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FullPageLoadingSkeleton />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200 shadow-none">
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          projectOwners={filterOptions?.projectOwners || []}
          projectTypes={filterOptions?.projectTypes || []}
          constructionTypeMains={filterOptions?.constructionTypeMains || []}
          constructionTypeSubs={filterOptions?.constructionTypeSubs || []}
          objectMains={filterOptions?.objectMains || []}
          causeMains={filterOptions?.causeMains || []}
          resultMains={filterOptions?.resultMains || []}
          constructionTypeSubOptions={constructionTypeSubOptions}
          disabled={isStatsLoading}
        />
      </Sidebar>
      <SidebarInset className="bg-transparent mesh-bg">
        <div className="flex h-full flex-col">
          <header className="glass-header px-8 py-6 shadow-sm">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <PageHeader
                  title="안전사고 통합 분석 대시보드"
                  subtitle="WBS-RBS 기반 위험정보 실시간 모니터링 시스템"
                />
                <div className="hidden lg:flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-slate-200/60 text-slate-600 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    지능형 RAG 분석 시스템 가동 중
                  </div>
                </div>
              </div>
              <DashboardNav />
            </div>
          </header>
          
          <div id="page-content" className="flex-1 overflow-auto">
            <div className="max-w-[1600px] mx-auto p-8 pt-6 space-y-8 animate-fade-in">
              <RecentSolutions />
              
              {isStatsLoading && !stats ? (
                <FullPageLoadingSkeleton />
              ) : (
                <>
                  <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-5 bg-indigo-600 rounded-full animate-pulse" />
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight">핵심 성과 지표 (KPI)</h2>
                    </div>
                    <DashboardMetrics stats={stats} />
                  </section>

                  <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-indigo-600 rounded-full animate-pulse" />
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight">유형별 추이 및 사고 분포</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in">
                        <AnnualAccidentsChart stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.1s' }}>
                        <MonthlyAccidentTrendChart stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.2s' }}>
                        <ConstructionSubtypeTreemap stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.3s' }}>
                        <ObjectSubtypeBarChart stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.4s' }}>
                        <ObjectSubtypeCountChart stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.5s' }}>
                        <CauseSubtypeBarChart stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.6s' }}>
                        <ResultMainChart stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.7s' }}>
                        <CauseResultMatrix stats={stats} />
                      </div>
                      <div className="pro-card border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm animate-scale-in" style={{ animationDelay: '0.8s' }}>
                        <RiskRatioChart
                          stats={stats}
                          constructionTypeMap={constructionTypeMap}
                          activeFilters={filters.constructionTypeSub || []}
                        />
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
