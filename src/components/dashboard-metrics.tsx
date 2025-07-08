import type { Incident } from '@/lib/types';
import KpiCard from './kpi-card';
import { AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

interface DashboardMetricsProps {
  incidents: Incident[];
}

export default function DashboardMetrics({ incidents }: DashboardMetricsProps) {
  const totalAccidents = incidents.length;
  
  const averageSeverity =
    totalAccidents > 0
      ? (incidents.reduce((acc, i) => acc + i.severityIndex, 0) / totalAccidents).toFixed(1)
      : 'N/A';

  const mostCommonCause =
    totalAccidents > 0
      ? Object.entries(
          incidents.reduce((acc, i) => {
            acc[i.causeMain] = (acc[i.causeMain] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <KpiCard title="총 사고 건수" value={totalAccidents} icon={AlertTriangle} />
      <KpiCard title="평균 심각도" value={averageSeverity} icon={TrendingUp} />
      <KpiCard title="최다 사고 원인" value={mostCommonCause} icon={ShieldAlert} />
    </div>
  );
}
