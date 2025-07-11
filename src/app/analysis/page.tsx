import AnalysisPageClient from '@/components/analysis-page-client';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage() {
  // Load all incidents to populate filter options initially
  const incidents = await getIncidents();

  const uniqueProjectOwners = [
    ...Array.from(new Set(incidents.map((i) => i.projectOwner).filter(Boolean))),
  ];
  const uniqueProjectTypes = [
    ...Array.from(new Set(incidents.map((i) => i.projectType).filter(Boolean))),
  ];
  const uniqueConstructionTypeMains = [
    ...Array.from(new Set(incidents.map((i) => i.constructionTypeMain).filter(Boolean))),
  ];
  const uniqueConstructionTypeSubs = [
    ...Array.from(new Set(incidents.map((i) => i.constructionTypeSub).filter(Boolean))),
  ];
  const uniqueObjectMains = [
    ...Array.from(new Set(incidents.map((i) => i.objectMain).filter(Boolean))),
  ];
  const uniqueCauseMains = [
    ...Array.from(new Set(incidents.map((i) => i.causeMain).filter(Boolean))),
  ];
  const uniqueResultMains = [
    ...Array.from(new Set(incidents.map((i) => i.resultMain).filter(Boolean))),
  ];

  return (
    <AnalysisPageClient
      // Start with an empty array for filtered incidents, they will be fetched on client
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
