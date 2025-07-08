import DashboardClient from '@/components/dashboard-client';
import { getIncidents } from '@/services/incident.service';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const incidents = await getIncidents();
  return <DashboardClient incidents={incidents} />;
}
