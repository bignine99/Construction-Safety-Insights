'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Incident } from '@/lib/types';
import { getIncidents, type IncidentFilters } from '@/services/incident.service';
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

function ChartsLoadingSkeleton() {
    return (
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
            ))}
        </div>
    );
}

export default function DashboardClient({ allIncidents }: { allIncidents: Incident[] }) {
  const [filters, setFilters] = useState<IncidentFilters>({
    projectOwner: [], projectType: [], constructionTypeMain: [],
    constructionTypeSub: [], objectMain: [], causeMain: [], resultMain: [],
  });

  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>(allIncidents);
  const [isLoading, setIsLoading] = useState(false);

  // Unique values for filters should be derived from all incidents, so they don't change.
  const uniqueProjectOwners = useMemo(() => [...Array.from(new Set(allIncidents.map(i => i.projectOwner).filter(Boolean)))], [allIncidents]);
  const uniqueProjectTypes = useMemo(() => [...Array.from(new Set(allIncidents.map(i => i.projectType).filter(Boolean)))], [allIncidents]);
  const uniqueConstructionTypeMains = useMemo(() => [...Array.from(new Set(allIncidents.map(i => i.constructionTypeMain).filter(Boolean)))], [allIncidents]);
  const uniqueConstructionTypeSubs = useMemo(() => [...Array.from(new Set(allIncidents.map(i => i.constructionTypeSub).filter(Boolean)))], [allIncidents]);
  const uniqueObjectMains = useMemo(() => [...Array.from(new Set(allIncidents.map(i => i.objectMain).filter(Boolean)))], [allIncidents]);
  const uniqueCauseMains = useMemo(() => [...Array.from(new Set(allIncidents.map(i => i.causeMain).filter(Boolean)))], [allIncidents]);
  const uniqueResultMains = useMemo(() => [...Array.from(new Set(allIncidents.map(i => i.resultMain).filter(Boolean)))], [allIncidents]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      setIsLoading(true);
      const activeFilters = Object.values(filters).some(f => f && f.length > 0);
      if (activeFilters) {
        const incidents = await getIncidents(filters);
        setFilteredIncidents(incidents);
      } else {
        setFilteredIncidents(allIncidents);
      }
      setIsLoading(false);
    };

    fetchFilteredData();
  }, [filters, allIncidents]);

  const constructionTypeSubOptions = useMemo(() => {
    if (!filters.constructionTypeMain || filters.constructionTypeMain.length === 0) {
      return uniqueConstructionTypeSubs;
    }
    const options = new Set<string>();
    filters.constructionTypeMain.forEach(mainType => {
      const subs = constructionTypeMap[mainType] || [];
      subs.forEach(sub => options.add(sub));
    });
    return Array.from(options);
  }, [filters.constructionTypeMain, uniqueConstructionTypeSubs]);

  return (
    <SidebarProvider>
      <Sidebar>
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          projectOwners={uniqueProjectOwners}
          projectTypes={uniqueProjectTypes}
          constructionTypeMains={uniqueConstructionTypeMains}
          constructionTypeSubs={uniqueConstructionTypeSubs}
          objectMains={uniqueObjectMains}
          causeMains={uniqueCauseMains}
          resultMains={uniqueResultMains}
          constructionTypeSubOptions={constructionTypeSubOptions}
        />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-10 flex flex-col gap-6 bg-background p-6">
            <PageHeader
              title="안전사고 분석 대시보드"
              subtitle="WBS-RBS 기반 위험정보 분석 시스템"
            />
            <DashboardNav />
          </div>
          <div id="page-content" className="flex flex-1 flex-col overflow-auto p-6 pt-2">
            <DashboardMetrics incidents={filteredIncidents} />
            {isLoading ? <ChartsLoadingSkeleton /> : (
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnnualAccidentsChart incidents={filteredIncidents} />
                <MonthlyAccidentTrendChart incidents={filteredIncidents} />
                <ConstructionSubtypeTreemap incidents={filteredIncidents} />
                <ObjectSubtypeBarChart incidents={filteredIncidents} />
                <ObjectSubtypeCountChart incidents={filteredIncidents} />
                <CauseSubtypeBarChart incidents={filteredIncidents} />
                <ResultMainChart incidents={filteredIncidents} />
                <CauseResultMatrix incidents={filteredIncidents} />
                <RiskRatioChart 
                  incidents={filteredIncidents} 
                  constructionTypeMap={constructionTypeMap}
                  activeFilters={filters.constructionTypeSub || []}
                />
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
