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
    projectOwner: [] as string[],
    projectType: [] as string[],
    constructionTypeMain: [] as string[],
    constructionTypeSub: [] as string[],
    objectMain: [] as string[],
    causeMain: [] as string[],
    resultMain: [] as string[],
  });

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
          projectOwners={uniqueProjectOwners.filter(o => o !== 'all')}
          projectTypes={uniqueProjectTypes.filter(o => o !== 'all')}
          constructionTypeMains={uniqueConstructionTypeMains.filter(o => o !== 'all')}
          constructionTypeSubs={uniqueConstructionTypeSubs.filter(o => o !== 'all')}
          objectMains={uniqueObjectMains.filter(o => o !== 'all')}
          causeMains={uniqueCauseMains.filter(o => o !== 'all')}
          resultMains={uniqueResultMains.filter(o => o !== 'all')}
          constructionTypeSubOptions={constructionTypeSubOptions}
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
    </SidebarProvider>
  );
}
