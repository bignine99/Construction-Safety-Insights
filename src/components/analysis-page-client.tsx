'use client';

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
  const filters = {
    projectOwner: 'all',
    projectType: 'all',
    constructionTypeMain: 'all',
    constructionTypeSub: 'all',
    objectMain: 'all',
    causeMain: 'all',
    resultMain: 'all',
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <FilterSidebar
            filters={filters}
            onFilterChange={() => {}} // No-op for this page
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
          <div className="w-full max-w-none flex flex-1 flex-col gap-6 p-4 md:p-6">
            <PageHeader
              title="AI 기반 안전사고 데이터 분석"
              subtitle="AI 기반 사건사고 데이터베이스 심층 분석"
            />
            <DashboardNav />
            <div className="flex-1">
              <AnalysisClient incidents={incidents} />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
