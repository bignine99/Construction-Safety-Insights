'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Incident } from '@/lib/types';
import { getIncidents, type IncidentFilters } from '@/services/incident.service';
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

interface AnalysisPageClientProps {
  initialIncidents: Incident[];
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


export default function AnalysisPageClient({
  initialIncidents,
  uniqueProjectOwners,
  uniqueProjectTypes,
  uniqueConstructionTypeMains,
  uniqueConstructionTypeSubs,
  uniqueObjectMains,
  uniqueCauseMains,
  uniqueResultMains,
}: AnalysisPageClientProps) {
  const [filters, setFilters] = useState<IncidentFilters>({
    projectOwner: [], projectType: [], constructionTypeMain: [],
    constructionTypeSub: [], objectMain: [], causeMain: [], resultMain: [],
  });

  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>(initialIncidents);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFilteredData = async () => {
      setIsLoading(true);
      const incidents = await getIncidents(filters);
      setFilteredIncidents(incidents);
      setIsLoading(false);
    };

    fetchFilteredData();
  }, [filters]);

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
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-10 flex flex-col gap-6 bg-background p-6">
            <PageHeader
              title="AI 기반 안전사고 데이터 분석"
              subtitle="AI 기반 사건사고 데이터베이스 심층 분석"
            />
            <DashboardNav />
          </div>
          <div id="page-content" className="flex flex-1 flex-col gap-6 overflow-auto p-6 pt-2">
            {isLoading ? (
                <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
                <FilteredIncidentsTable incidents={filteredIncidents} />
            )}
            <AnalysisClient incidents={filteredIncidents} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
