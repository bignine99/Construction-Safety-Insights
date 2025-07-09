import AdminPageClient from '@/components/admin-page-client';
import { DashboardNav } from '@/components/dashboard-nav';
import PageHeader from '@/components/page-header';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-4">
      <PageHeader
        title="데이터 관리"
        subtitle="사고 데이터베이스(Firestore) 관리"
      />
      <DashboardNav />
      <div className="flex flex-1 flex-col gap-6">
        <AdminPageClient />
      </div>
    </div>
  );
}
