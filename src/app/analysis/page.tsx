import AnalysisPageClient from '@/components/analysis-page-client';
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

  return (
    <AnalysisPageClient
      incidents={incidents}
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
