import AnalysisClient from '@/components/analysis-client';
import Header from '@/components/header';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage() {
  const incidents = await getIncidents();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <AnalysisClient incidents={incidents} />
      </main>
    </div>
  );
}
