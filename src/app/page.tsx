import DashboardClient from '@/components/dashboard-client';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Initially load all unique filter values, not all incidents
  const incidents = await getIncidents(); // This is now just for unique values
  const uniqueProjectOwners = [...Array.from(new Set(incidents.map((i) => i.projectOwner).filter(Boolean)))];
  const uniqueProjectTypes = [...Array.from(new Set(incidents.map((i) => i.projectType).filter(Boolean)))];
  const uniqueConstructionTypeMains = [...Array.from(new Set(incidents.map((i) => i.constructionTypeMain).filter(Boolean)))];
  const uniqueConstructionTypeSubs = [...Array.from(new Set(incidents.map((i) => i.constructionTypeSub).filter(Boolean)))];
  const uniqueObjectMains = [...Array.from(new Set(incidents.map((i) => i.objectMain).filter(Boolean)))];
  const uniqueCauseMains = [...Array.from(new Set(incidents.map((i) => i.causeMain).filter(Boolean)))];
  const uniqueResultMains = [...Array.from(new Set(incidents.map((i) => i.resultMain).filter(Boolean)))];

  return (
    <DashboardClient
      initialIncidents={[]} // Start with empty incidents, fetch on client
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
