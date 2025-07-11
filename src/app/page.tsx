import DashboardClient from '@/components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Data fetching is now handled on the client side in DashboardClient
  // to improve initial page load performance.
  return (
    <DashboardClient />
  );
}
