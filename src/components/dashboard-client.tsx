'use client';

import React, { useState, useMemo } from 'react';
import type { Incident } from '@/lib/types';
import FilterSidebar from '@/components/filter-sidebar';
import DashboardMetrics from '@/components/dashboard-metrics';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import PageHeader from './page-header';
import MonthlyAccidentsChart from './monthly-accidents-chart';
import ConstructionSubtypePieChart from './construction-subtype-pie-chart';
import { Card } from './ui/card';
import ObjectSubtypeBarChart from './object-subtype-bar-chart';
import CauseSubtypeBarChart from './cause-subtype-bar-chart';
import ResultMainChart from './result-main-chart';

export default function DashboardClient({ incidents }: { incidents: Incident[] }) {
  const [filters, setFilters] = useState({
    projectType: 'all',
    causeMain: 'all',
    projectCost: 'all',
  });

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const { projectType, causeMain, projectCost } = filters;
      const projectTypeMatch = projectType === 'all' || incident.projectType === projectType;
      const causeMainMatch = causeMain === 'all' || incident.causeMain === causeMain;
      const projectCostMatch = projectCost === 'all' || incident.projectCost === projectCost;
      return projectTypeMatch && causeMainMatch && projectCostMatch;
    });
  }, [filters, incidents]);

  const uniqueProjectTypes = useMemo(
    () => ['all', ...Array.from(new Set(incidents.map(i => i.projectType)))],
    [incidents]
  );
  const uniqueCauses = useMemo(
    () => ['all', ...Array.from(new Set(incidents.map(i => i.causeMain).filter(Boolean)))],
    [incidents]
  );
  const uniqueProjectCosts = useMemo(() => {
    const costs = new Set(incidents.map(i => i.projectCost));
    const sortedCosts = Array.from(costs).sort((a, b) => {
        if (a.includes('~')) return 1;
        if (b.includes('~')) return -1;
        const valA = parseFloat(a.replace(/,/g, ''));
        const valB = parseFloat(b.replace(/,/g, ''));
        if (isNaN(valA)) return 1;
        if (isNaN(valB)) return -1;
        return valA - valB;
    });
    return ['all', ...sortedCosts];
  }, [incidents]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            projectTypes={uniqueProjectTypes}
            causes={uniqueCauses}
            projectCosts={uniqueProjectCosts}
          />
        </Sidebar>
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <PageHeader 
              title="안전사고 분석 대시보드"
              subtitle="건설 안전 데이터를 분석하여 추세 파악 및 미래 사고 예방"
            />
            <DashboardMetrics incidents={filteredIncidents} />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MonthlyAccidentsChart incidents={filteredIncidents} />
              <ConstructionSubtypePieChart incidents={filteredIncidents} />
              <ObjectSubtypeBarChart incidents={filteredIncidents} />
              <CauseSubtypeBarChart incidents={filteredIncidents} />
              <ResultMainChart incidents={filteredIncidents} />
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="flex min-h-[426px] items-center justify-center p-6">
                  <p className="text-muted-foreground">차트 영역 {index + 6}</p>
                </Card>
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
