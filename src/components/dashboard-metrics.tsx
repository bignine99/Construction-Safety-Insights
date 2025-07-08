import type { Incident } from '@/lib/types';
import KpiCard from './kpi-card';
import {
  AlertTriangle,
  HeartCrack,
  Users,
  CreditCard,
  TrendingUp,
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
  
  const averageCostDamage =
    totalAccidents > 0 
      ? Math.round(totalCostDamage / totalAccidents)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      <KpiCard 
        title="총 사고 건수" 
        value={totalAccidents} 
        description="기록된 총 사고 건수"
        icon={AlertTriangle} 
      />
      <KpiCard 
        title="사망자" 
        value={totalFatalities} 
        description="총 사망자 수"
        icon={HeartCrack}
        iconClassName="text-destructive"
      />
      <KpiCard 
        title="부상자" 
        value={totalInjuries} 
        description="총 부상자 수"
        icon={Users} 
      />
      <KpiCard 
        title="피해금액" 
        value={`${averageCostDamage.toLocaleString()}만원`}
        description="사건당 평균 피해금액(만원)"
        icon={CreditCard} 
      />
      <KpiCard 
        title="사고위험지수" 
        value={averageRiskIndex} 
        description="평균 사고 심각도 점수"
        icon={TrendingUp} 
      />
    </div>
  );
}
