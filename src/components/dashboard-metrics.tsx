import type { Incident } from '@/lib/types';
import KpiCard from './kpi-card';
import {
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  UserX,
  Ambulance,
  CircleDollarSign,
  Construction,
  Box,
} from 'lucide-react';

interface DashboardMetricsProps {
  incidents: Incident[];
}

export default function DashboardMetrics({ incidents }: DashboardMetricsProps) {
  const totalAccidents = incidents.length;
  const totalFatalities = incidents.reduce((acc, i) => acc + i.fatalities, 0);
  const totalInjuries = incidents.reduce((acc, i) => acc + i.injuries, 0);
  const totalCostDamage = incidents.reduce((acc, i) => acc + i.costDamage, 0);

  const averageRiskIndex =
    totalAccidents > 0
      ? (incidents.reduce((acc, i) => acc + i.riskIndex, 0) / totalAccidents).toFixed(2)
      : 'N/A';

  const getMostCommon = (key: keyof Incident) => {
    if (totalAccidents === 0) return 'N/A';
    const counts = incidents.reduce((acc, i) => {
      const value = i[key] as string;
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "N/A";
  };

  const mostCommonCause = getMostCommon('causeMain');
  const mostCommonConstructionType = getMostCommon('constructionTypeMain');
  const mostCommonObject = getMostCommon('objectMain');

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="총 사고 건수" value={totalAccidents} icon={AlertTriangle} />
      <KpiCard title="총 사망자 수" value={totalFatalities} icon={UserX} />
      <KpiCard title="총 부상자 수" value={totalInjuries} icon={Ambulance} />
      <KpiCard title="총 피해 금액 (백만원)" value={totalCostDamage.toLocaleString()} icon={CircleDollarSign} />
      <KpiCard title="평균 사고위험지수" value={averageRiskIndex} icon={TrendingUp} />
      <KpiCard title="최다 사고 원인" value={mostCommonCause} icon={ShieldAlert} />
      <KpiCard title="최다 사고 공종" value={mostCommonConstructionType} icon={Construction} />
      <KpiCard title="최다 사고 객체" value={mostCommonObject} icon={Box} />
    </div>
  );
}

    