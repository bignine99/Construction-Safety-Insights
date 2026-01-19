'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Incident } from '@/lib/types';
import type { IncidentFilters } from '@/services/incident.service';
import { getPaginatedIncidentsAction, getFilterOptions } from '@/app/actions';
import AnalysisClient from '@/components/analysis-client';
import { DashboardNav } from '@/components/dashboard-nav';
import FilterSidebar from '@/components/filter-sidebar';
import PageHeader from '@/components/page-header';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import FilteredIncidentsTable from './filtered-incidents-table';
import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';
import { LayoutDashboard, FileSearch, ShieldCheck } from 'lucide-react';

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

function ProSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
      <Skeleton className="h-[300px] w-full rounded-2xl" />
    </div>
  );
}

export default function AnalysisPageClient() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [filters, setFilters] = useState<IncidentFilters>({
    projectOwner: [], projectType: [], constructionTypeMain: [],
    constructionTypeSub: [], objectMain: [], causeMain: [], resultMain: [],
  });

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setIsDataLoading(true);
      try {
        const [options, result] = await Promise.all([
          getFilterOptions(),
          getPaginatedIncidentsAction(filters, page, pageSize)
        ]);
        setFilterOptions(options);
        setIncidents(result.incidents);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error('Failed to load initial analysis data:', error);
      } finally {
        setIsLoading(false);
        setIsDataLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    async function loadData() {
      setIsDataLoading(true);
      try {
        const result = await getPaginatedIncidentsAction(filters, page, pageSize);
        setIncidents(result.incidents);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error('Failed to load incidents:', error);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, [filters, page]);

  const handleFilterChange = (newFilters: IncidentFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

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
      <div className="p-8 bg-slate-50 min-h-screen">
        <ProSkeleton />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200 shadow-xl">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          projectOwners={filterOptions?.projectOwners || []}
          projectTypes={filterOptions?.projectTypes || []}
          constructionTypeMains={filterOptions?.constructionTypeMains || []}
          constructionTypeSubs={filterOptions?.constructionTypeSubs || []}
          objectMains={filterOptions?.objectMains || []}
          causeMains={filterOptions?.causeMains || []}
          resultMains={filterOptions?.resultMains || []}
          constructionTypeSubOptions={constructionTypeSubOptions}
          disabled={isDataLoading}
        />
      </Sidebar>
      
      <SidebarInset className="bg-transparent mesh-bg">
        <div className="flex h-full flex-col">
          {/* 상단 럭셔리 헤더 섹션 */}
          <header className="sticky top-0 z-30 glass-header px-8 py-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <PageHeader
                  title="지능형 안전사고 데이터 분석"
                  subtitle="WBS-RBS 기반의 정밀 안전 진단 및 AI 리포트"
                />
                <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200/60 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  지능형 RAG 분석 엔진 가동 중
                </div>
              </div>
              <DashboardNav />
            </div>
          </header>
          
          <main id="page-content" className="flex-1 p-8 pt-6 overflow-auto max-w-7xl mx-auto w-full space-y-8">
            {/* 데이터 요약 카드 (통계적 가치 강조) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 pro-card-indigo shimmer-effect">
                <p className="text-indigo-100 text-sm font-medium">분석 대상 데이터</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{totalCount.toLocaleString()}<span className="text-lg font-normal ml-1 text-indigo-200">건</span></h3>
                <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200">
                  <FileSearch className="w-4 h-4" />
                  실시간 필터링 적용 중
                </div>
              </Card>
              <Card className="p-6 pro-card shadow-sm">
                <p className="text-slate-500 text-sm font-medium">현재 페이지</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">{page}<span className="text-lg font-normal ml-1 text-slate-400">/ {Math.ceil(totalCount / pageSize)}</span></h3>
                <p className="mt-4 text-xs text-slate-400">데이터 테이블 기반 상세 분석</p>
              </Card>
              <Card className="p-6 pro-card shadow-sm">
                <p className="text-slate-500 text-sm font-medium">AI 분석 모델</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">Gemini <span className="text-indigo-600">2.0 Flash</span></h3>
                <p className="mt-4 text-xs text-slate-400">전문가용 심층 분석 알고리즘 가동 중</p>
              </Card>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="grid grid-cols-1 gap-8 animate-fade-in">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">사고 데이터 상세 명세</h2>
                </div>
                <FilteredIncidentsTable 
                  incidents={incidents} 
                  totalCount={totalCount}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  isLoading={isDataLoading}
                />
              </section>

              <section className="space-y-4 pb-12">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">AI 디지털 안전 진단</h2>
                </div>
                <AnalysisClient incidents={incidents} />
              </section>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
