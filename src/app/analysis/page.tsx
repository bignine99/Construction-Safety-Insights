import AnalysisPageClient from '@/components/analysis-page-client';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage() {
  // Data fetching is now handled on the client side in AnalysisPageClient
  // to improve initial page load performance.
  return (
    <AnalysisPageClient />
  );
}
