'use client';

import { useMemo, useState } from 'react';
import type { Incident } from '@/lib/types';
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

interface AnalysisPageClientProps {
  incidents: Incident[];
  uniqueProjectOwners: string[];
  uniqueProjectTypes: string[];
  uniqueConstructionTypeMains: string[];
  uniqueConstructionTypeSubs: string[];
  uniqueObjectMains: string[];
  uniqueCauseMains: string[];
  uniqueResultMains: string[];
}

export default function AnalysisPageClient({
  incidents,
  uniqueProjectOwners,
  uniqueProjectTypes,
  uniqueConstructionTypeMains,
  uniqueConstructionTypeSubs,
  uniqueObjectMains,
  uniqueCauseMains,
  uniqueResultMains,
}: AnalysisPageClientProps) {
  const [filters, setFilters] = useState({
    projectOwner: 'all',
    projectType: 'all',
    constructionTypeMain: 'all',
    constructionTypeSub: 'all',
    objectMain: 'all',
    causeMain: 'all',
    resultMain: 'all',
  });

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
        projectOwner === 'all' || incident.projectOwner === projectOwner;
      const projectTypeMatch =
        projectType === 'all' || incident.projectType === projectType;
      const constructionTypeMainMatch =
        constructionTypeMain === 'all' ||
        incident.constructionTypeMain === constructionTypeMain;
      const constructionTypeSubMatch =
        constructionTypeSub === 'all' ||
        incident.constructionTypeSub === constructionTypeSub;
      const objectMainMatch =
        objectMain === 'all' || incident.objectMain === objectMain;
      const causeMainMatch =
        causeMain === 'all' || incident.causeMain === causeMain;
      const resultMainMatch =
        resultMain === 'all' || incident.resultMain === resultMain;

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
      <div className="flex min-h-screen">
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
          />
        </Sidebar>
        <SidebarInset>
          <div className="w-full max-w-none flex flex-1 flex-col gap-6 p-2">
            <PageHeader
              title="AI 기반 안전사고 데이터 분석"
              subtitle="AI 기반 사건사고 데이터베이스 심층 분석"
            />
            <DashboardNav />
            <div className="flex flex-1 flex-col gap-6">
              <FilteredIncidentsTable incidents={filteredIncidents} />
              <AnalysisClient incidents={filteredIncidents} />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
