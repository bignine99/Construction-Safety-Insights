import DashboardClient from '@/components/dashboard-client';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Initially load all incidents for the full view
  const incidents = await getIncidents();
  return <DashboardClient allIncidents={incidents} />;
}
