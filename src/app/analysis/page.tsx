import AnalysisClient from '@/components/analysis-client';
import FilterSidebar from '@/components/filter-sidebar';
import PageHeader from '@/components/page-header';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage() {
  const incidents = await getIncidents();
  
  const uniqueProjectTypes = ['all', ...Array.from(new Set(incidents.map(i => i.projectType)))];
  const uniqueCauses = ['all', ...Array.from(new Set(incidents.map(i => i.causeMain)))];
  const maxCost = Math.max(...incidents.map(i => i.projectCost), 30000000);
  
  const filters = {
    projectType: 'all',
    causeMain: 'all',
    projectCost: [0, maxCost] as [number, number],
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <FilterSidebar
            filters={filters}
            onFilterChange={() => {}} // No-op for this page
            projectTypes={uniqueProjectTypes}
            causes={uniqueCauses}
            maxCost={maxCost}
          />
        </Sidebar>
        <SidebarInset>
          <main className="flex flex-1 flex-col p-4 md:p-6">
            <PageHeader
              title="AI 사고 분석"
              subtitle="사고 설명 데이터를 기반으로 AI가 핵심 테마를 분석하고 예방 대책을 제안합니다."
            />
            <div className="flex-1">
              <AnalysisClient incidents={incidents} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
