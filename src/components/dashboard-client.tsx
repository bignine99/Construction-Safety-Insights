// src/components/dashboard-client.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Incident } from '@/lib/types';
import type { IncidentFilters } from '@/services/incident.service';
import { getIncidents } from '@/app/actions'; // Import from actions
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
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<IncidentFilters>({
    projectOwner: [], projectType: [], constructionTypeMain: [],
    constructionTypeSub: [], objectMain: [], causeMain: [], resultMain: [],
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const incidents = await getIncidents();
      setAllIncidents(incidents);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const uniqueValues = useMemo(() => {
    if (isLoading) {
      return {
        uniqueProjectOwners: [], uniqueProjectTypes: [], uniqueConstructionTypeMains: [],
        uniqueConstructionTypeSubs: [], uniqueObjectMains: [], uniqueCauseMains: [], uniqueResultMains: []
      };
    }
    return {
      uniqueProjectOwners: [...new Set(allIncidents.map((i) => i.projectOwner).filter(Boolean))],
      uniqueProjectTypes: [...new Set(allIncidents.map((i) => i.projectType).filter(Boolean))],
      uniqueConstructionTypeMains: [...new Set(allIncidents.map((i) => i.constructionTypeMain).filter(Boolean))],
      uniqueConstructionTypeSubs: [...new Set(allIncidents.map((i) => i.constructionTypeSub).filter(Boolean))],
      uniqueObjectMains: [...new Set(allIncidents.map((i) => i.objectMain).filter(Boolean))],
      uniqueCauseMains: [...new Set(allIncidents.map((i) => i.causeMain).filter(Boolean))],
      uniqueResultMains: [...new Set(allIncidents.map((i) => i.resultMain).filter(Boolean))],
    };
  }, [isLoading, allIncidents]);

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter(incident => {
      if (filters.projectOwner?.length && !filters.projectOwner.includes(incident.projectOwner)) return false;
      if (filters.projectType?.length && !filters.projectType.includes(incident.projectType)) return false;
      if (filters.constructionTypeMain?.length && !filters.constructionTypeMain.includes(incident.constructionTypeMain)) return false;
      if (filters.constructionTypeSub?.length && !filters.constructionTypeSub.includes(incident.constructionTypeSub)) return false;
      if (filters.objectMain?.length && !filters.objectMain.includes(incident.objectMain)) return false;
      if (filters.causeMain?.length && !filters.causeMain.includes(incident.causeMain)) return false;
      if (filters.resultMain?.length && !filters.resultMain.includes(incident.resultMain)) return false;
      return true;
    });
  }, [filters, allIncidents]);

  const constructionTypeSubOptions = useMemo(() => {
    if (!filters.constructionTypeMain || filters.constructionTypeMain.length === 0) {
      return uniqueValues.uniqueConstructionTypeSubs;
    }
    const options = new Set<string>();
    filters.constructionTypeMain.forEach(mainType => {
      const subs = constructionTypeMap[mainType] || [];
      subs.forEach(sub => options.add(sub));
    });
    return Array.from(options);
  }, [filters.constructionTypeMain, uniqueValues.uniqueConstructionTypeSubs]);

  return (
    <SidebarProvider>
      <Sidebar>
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          projectOwners={uniqueValues.uniqueProjectOwners}
          projectTypes={uniqueValues.uniqueProjectTypes}
          constructionTypeMains={uniqueValues.uniqueConstructionTypeMains}
          constructionTypeSubs={uniqueValues.uniqueConstructionTypeSubs}
          objectMains={uniqueValues.uniqueObjectMains}
          causeMains={uniqueValues.uniqueCauseMains}
          resultMains={uniqueValues.uniqueResultMains}
          constructionTypeSubOptions={constructionTypeSubOptions}
          disabled={isLoading}
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
          {isLoading ? <FullPageLoadingSkeleton /> : (
            <div id="page-content" className="flex flex-1 flex-col overflow-auto p-6 pt-2">
              <DashboardMetrics incidents={filteredIncidents} />
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
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
