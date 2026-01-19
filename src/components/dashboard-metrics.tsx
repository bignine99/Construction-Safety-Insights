'use client';

import { 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  LayoutGrid, 
  Users,
  AlertTriangle 
} from 'lucide-react';
import type { DashboardStats } from '@/lib/types';
import KpiCard from './kpi-card';

interface DashboardMetricsProps {
  stats: DashboardStats | null;
}

export default function DashboardMetrics({ stats }: DashboardMetricsProps) {
  if (!stats) return null;

  const totalAccidents = stats.totalAccidents || 0;
  const totalFatalities = stats.totalFatalities || 0;
  const avgRiskIndex = stats.averageRiskIndex || 0;
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="전체 사고 데이터"
        value={`${totalAccidents.toLocaleString()}건`}
        description="시스템에 등록된 전체 안전사고 건수"
        icon={LayoutGrid}
        iconClassName="text-indigo-600"
        trend={{ value: 12, isUp: true }}
      />
      <KpiCard
        title="인명 피해 현황"
        value={`${totalFatalities.toLocaleString()}명`}
        description="사고로 인한 전체 사망자 수"
        icon={Users}
        iconClassName="text-rose-600"
        trend={{ value: 3, isUp: false }}
      />
      <KpiCard
        title="평균 위험지수"
        value={avgRiskIndex.toFixed(1)}
        description="전체 사고의 통계적 위험 수준"
        icon={Activity}
        iconClassName="text-amber-600"
        trend={{ value: 1.5, isUp: false }}
      />
      <KpiCard
        title="데이터 정밀도"
        value="99.9%"
        description="AI 엔진 분석 및 데이터 무결성"
        icon={TrendingUp}
        iconClassName="text-emerald-600"
        trend={{ value: 0.1, isUp: true }}
      />
    </div>
  );
}
