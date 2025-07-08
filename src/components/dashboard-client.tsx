'use client';

import React, { useState, useMemo } from 'react';
import type { Incident } from '@/lib/types';
import FilterSidebar from '@/components/filter-sidebar';
import DashboardMetrics from '@/components/dashboard-metrics';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import PageHeader from './page-header';
import MonthlyAccidentsChart from './monthly-accidents-chart';
import ConstructionSubtypePieChart from './construction-subtype-pie-chart';
import ObjectSubtypeBarChart from './object-subtype-bar-chart';
import ObjectSubtypeCountChart from './object-subtype-count-chart';
import CauseSubtypeBarChart from './cause-subtype-bar-chart';
import ResultMainChart from './result-main-chart';
import CauseResultMatrix from './cause-result-matrix';
import RiskRatioChart from './risk-ratio-chart';

export default function DashboardClient({ incidents }: { incidents: Incident[] }) {
  const [filters, setFilters] = useState({
    constructionTypeMain: 'all',
    constructionTypeSub: 'all',
    objectMain: 'all',
    causeMain: 'all',
    resultMain: 'all',
  });

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const { constructionTypeMain, constructionTypeSub, objectMain, causeMain, resultMain } = filters;
      const constructionTypeMainMatch = constructionTypeMain === 'all' || incident.constructionTypeMain === constructionTypeMain;
      const constructionTypeSubMatch = constructionTypeSub === 'all' || incident.constructionTypeSub === constructionTypeSub;
      const objectMainMatch = objectMain === 'all' || incident.objectMain === objectMain;
      const causeMainMatch = causeMain === 'all' || incident.causeMain === causeMain;
      const resultMainMatch = resultMain === 'all' || incident.resultMain === resultMain;
      
      return constructionTypeMainMatch && constructionTypeSubMatch && objectMainMatch && causeMainMatch && resultMainMatch;
    });
  }, [filters, incidents]);

  const uniqueConstructionTypeMains = useMemo(() => ['all', ...Array.from(new Set(incidents.map(i => i.constructionTypeMain).filter(Boolean)))], [incidents]);
  const uniqueConstructionTypeSubs = useMemo(() => ['all', ...Array.from(new Set(incidents.map(i => i.constructionTypeSub).filter(Boolean)))], [incidents]);
  const uniqueObjectMains = useMemo(() => ['all', ...Array.from(new Set(incidents.map(i => i.objectMain).filter(Boolean)))], [incidents]);
  const uniqueCauseMains = useMemo(() => ['all', ...Array.from(new Set(incidents.map(i => i.causeMain).filter(Boolean)))], [incidents]);
  const uniqueResultMains = useMemo(() => ['all', ...Array.from(new Set(incidents.map(i => i.resultMain).filter(Boolean)))], [incidents]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            constructionTypeMains={uniqueConstructionTypeMains}
            constructionTypeSubs={uniqueConstructionTypeSubs}
            objectMains={uniqueObjectMains}
            causeMains={uniqueCauseMains}
            resultMains={uniqueResultMains}
          />
        </Sidebar>
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <PageHeader 
              title="안전사고 분석 대시보드"
              subtitle="WBS-RBS 기반 위험정보 분석 시스템"
            />
            <DashboardMetrics incidents={filteredIncidents} />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MonthlyAccidentsChart incidents={filteredIncidents} />
              <ConstructionSubtypePieChart incidents={filteredIncidents} />
              <ObjectSubtypeBarChart incidents={filteredIncidents} />
              <ObjectSubtypeCountChart incidents={filteredIncidents} />
              <CauseSubtypeBarChart incidents={filteredIncidents} />
              <ResultMainChart incidents={filteredIncidents} />
              <CauseResultMatrix incidents={filteredIncidents} />
              <RiskRatioChart incidents={filteredIncidents} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
