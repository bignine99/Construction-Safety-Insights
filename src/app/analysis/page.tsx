import AnalysisPageClient from '@/components/analysis-page-client';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage() {
  // We no longer fetch all incidents here to get unique values.
  // This will be handled on the client side to improve initial load time.
  const allIncidents = await getIncidents();

  const uniqueProjectOwners = [...new Set(allIncidents.map(i => i.projectOwner).filter(Boolean))];
  const uniqueProjectTypes = [...new Set(allIncidents.map(i => i.projectType).filter(Boolean))];
  const uniqueConstructionTypeMains = [...new Set(allIncidents.map(i => i.constructionTypeMain).filter(Boolean))];
  const uniqueConstructionTypeSubs = [...new Set(allIncidents.map(i => i.constructionTypeSub).filter(Boolean))];
  const uniqueObjectMains = [...new Set(allIncidents.map(i => i.objectMain).filter(Boolean))];
  const uniqueCauseMains = [...new Set(allIncidents.map(i => i.causeMain).filter(Boolean))];
  const uniqueResultMains = [...new Set(allIncidents.map(i => i.resultMain).filter(Boolean))];

  return (
    <AnalysisPageClient
      initialIncidents={[]}
      uniqueProjectOwners={uniqueProjectOwners}
      uniqueProjectTypes={uniqueProjectTypes}
      uniqueConstructionTypeMains={uniqueConstructionTypeMains}
      uniqueConstructionTypeSubs={uniqueConstructionTypeSubs}
      uniqueObjectMains={uniqueObjectMains}
      uniqueCauseMains={uniqueCauseMains}
      uniqueResultMains={uniqueResultMains}
    />
  );
}
