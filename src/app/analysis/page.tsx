import AnalysisClient from '@/components/analysis-client';
import { DashboardNav } from '@/components/dashboard-nav';
import FilterSidebar from '@/components/filter-sidebar';
import PageHeader from '@/components/page-header';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage() {
  const incidents = await getIncidents();

  const uniqueProjectOwners = [
    'all',
    ...Array.from(new Set(incidents.map((i) => i.projectOwner).filter(Boolean))),
  ];
  const uniqueProjectTypes = [
    'all',
    ...Array.from(new Set(incidents.map((i) => i.projectType).filter(Boolean))),
  ];
  const uniqueConstructionTypeMains = [
    'all',
    ...Array.from(new Set(incidents.map((i) => i.constructionTypeMain).filter(Boolean))),
  ];
  const uniqueConstructionTypeSubs = [
    'all',
    ...Array.from(new Set(incidents.map((i) => i.constructionTypeSub).filter(Boolean))),
  ];
  const uniqueObjectMains = [
    'all',
    ...Array.from(new Set(incidents.map((i) => i.objectMain).filter(Boolean))),
  ];
  const uniqueCauseMains = [
    'all',
    ...Array.from(new Set(incidents.map((i) => i.causeMain).filter(Boolean))),
  ];
  const uniqueResultMains = [
    'all',
    ...Array.from(new Set(incidents.map((i) => i.resultMain).filter(Boolean))),
  ];

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
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <PageHeader
              title="AI 기반 안전사고 데이터 분석"
              subtitle="AI 기반 사건사고 데이터베이스 심층 분석"
            />
            <DashboardNav />
            <div className="flex-1">
              <AnalysisClient incidents={incidents} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
