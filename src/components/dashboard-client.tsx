'use client';

import React, { useState, useMemo } from 'react';
import type { Incident } from '@/lib/types';
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

const constructionTypeMap: Record<string, string[]> = {
  건축: [
    '해체및철거공사',
    '금속공사',
    '목공사',
    '수장공사',
    '도장공사',
    '지붕및홈통공사',
    '가설공사',
    '철근콘크리트공사',
    '철골공사',
    '조적공사',
    '미장공사',
    '방수공사',
    '타일및석공사',
    '창호및유리공사',
  ],
  토목: [
    '토공사',
    '지정공사',
    '관공사',
    '부대공사',
    '조경공사',
    '도로및포장공사',
  ],
  설비: ['기계설비공사', '전기설비공사', '통신설비공사'],
  기타: ['기타'],
};

export default function DashboardClient({
  incidents,
}: {
  incidents: Incident[];
}) {
  const [filters, setFilters] = useState({
    projectOwner: [] as string[],
    projectType: [] as string[],
    constructionTypeMain: [] as string[],
    constructionTypeSub: [] as string[],
    objectMain: [] as string[],
    causeMain: [] as string[],
    resultMain: [] as string[],
  });

  const uniqueProjectOwners = useMemo(
    () => [...Array.from(new Set(incidents.map(i => i.projectOwner).filter(Boolean)))],
    [incidents]
  );
  const uniqueProjectTypes = useMemo(
    () => [...Array.from(new Set(incidents.map(i => i.projectType).filter(Boolean)))],
    [incidents]
  );
  const uniqueConstructionTypeMains = useMemo(
    () => [
      ...Array.from(new Set(incidents.map(i => i.constructionTypeMain).filter(Boolean))),
    ],
    [incidents]
  );
  const uniqueConstructionTypeSubs = useMemo(
    () => [
      ...Array.from(new Set(incidents.map(i => i.constructionTypeSub).filter(Boolean))),
    ],
    [incidents]
  );
  const uniqueObjectMains = useMemo(
    () => [...Array.from(new Set(incidents.map(i => i.objectMain).filter(Boolean)))],
    [incidents]
  );
  const uniqueCauseMains = useMemo(
    () => [...Array.from(new Set(incidents.map(i => i.causeMain).filter(Boolean)))],
    [incidents]
  );
  const uniqueResultMains = useMemo(
    () => [...Array.from(new Set(incidents.map(i => i.resultMain).filter(Boolean)))],
    [incidents]
  );

  const constructionTypeSubOptions = useMemo(() => {
    if (filters.constructionTypeMain.length === 0) {
      return uniqueConstructionTypeSubs;
    }
    const options = new Set<string>();
    filters.constructionTypeMain.forEach(mainType => {
      const subs = constructionTypeMap[mainType] || [];
      subs.forEach(sub => options.add(sub));
    });
    return Array.from(options);
  }, [filters.constructionTypeMain, uniqueConstructionTypeSubs]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const {
        projectOwner,
        projectType,
        constructionTypeMain,
        constructionTypeSub,
        objectMain,
        causeMain,
        resultMain,
      } = filters;

      const projectOwnerMatch =
        projectOwner.length === 0 || projectOwner.includes(incident.projectOwner);
      const projectTypeMatch =
        projectType.length === 0 || projectType.includes(incident.projectType);
      const constructionTypeMainMatch =
        constructionTypeMain.length === 0 ||
        constructionTypeMain.includes(incident.constructionTypeMain);
      const constructionTypeSubMatch =
        constructionTypeSub.length === 0 ||
        constructionTypeSub.includes(incident.constructionTypeSub);
      const objectMainMatch =
        objectMain.length === 0 || objectMain.includes(incident.objectMain);
      const causeMainMatch =
        causeMain.length === 0 || causeMain.includes(incident.causeMain);
      const resultMainMatch =
        resultMain.length === 0 || resultMain.includes(incident.resultMain);

      return (
        projectOwnerMatch &&
        projectTypeMatch &&
        constructionTypeMainMatch &&
        constructionTypeSubMatch &&
        objectMainMatch &&
        causeMainMatch &&
        resultMainMatch
      );
    });
  }, [filters, incidents]);

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
          <div className="flex flex-1 flex-col overflow-auto p-6 pt-2">
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
                activeFilters={filters.constructionTypeSub}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
