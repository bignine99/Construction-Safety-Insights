import type { Incident } from '@/lib/types';
import KpiCard from './kpi-card';
import {
  HardHat,
  HelpCircle,
  Wrench,
  Activity,
  Building,
  Landmark,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

interface SecondaryMetricsProps {
  incidents: Incident[];
}

function getMostFrequent(items: (string | undefined)[]): { name: string; description: string } {
  if (items.length === 0) {
    return { name: 'N/A', description: '데이터 없음' };
  }
  const filteredItems = items.filter((i): i is string => !!i && i !== '미입력' && i !== '기타');
  if (filteredItems.length === 0) {
    return { name: 'N/A', description: '데이터 없음' };
  }

  const frequencyMap = filteredItems.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequent = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1])[0];

  if (!mostFrequent) {
    return { name: 'N/A', description: '데이터 없음' };
  }

  const percentage = ((mostFrequent[1] / filteredItems.length) * 100).toFixed(1);
  return { name: mostFrequent[0], description: `${mostFrequent[1]}건 (${percentage}%)` };
}

export default function SecondaryMetrics({ incidents }: SecondaryMetricsProps) {
  const totalAccidents = incidents.length;
  
  if (totalAccidents === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center text-muted-foreground">
        표시할 데이터가 없습니다. 필터를 조정해 주세요.
      </div>
    );
  }

  const topConstructionType = getMostFrequent(incidents.map(i => i.constructionTypeMain));
  const topCause = getMostFrequent(incidents.map(i => i.causeMain));
  const topWorkType = getMostFrequent(incidents.map(i => i.workType));
  const topResult = getMostFrequent(incidents.map(i => i.resultMain));

  const privateSectorIncidents = incidents.filter(i => i.projectOwner === '민간').length;
  const publicSectorIncidents = incidents.filter(i => i.projectOwner === '공공').length;
  
  const highCostIncidents = incidents.filter(i => i.projectCost.includes('~') || parseFloat(i.projectCost.replace(/,/g, '')) >= 1000).length;
  const highRiskIncidents = incidents.filter(i => i.riskIndex >= 1.0).length;

  const metrics = [
    { title: '최다 발생 공종', value: topConstructionType.name, description: topConstructionType.description, icon: HardHat },
    { title: '최다 발생 사고원인', value: topCause.name, description: topCause.description, icon: HelpCircle },
    { title: '최다 발생 작업', value: topWorkType.name, description: topWorkType.description, icon: Wrench },
    { title: '최다 발생 사고결과', value: topResult.name, description: topResult.description, icon: Activity },
    { title: '민간 사업 사고', value: privateSectorIncidents.toLocaleString() + '건', description: `${totalAccidents > 0 ? ((privateSectorIncidents / totalAccidents) * 100).toFixed(1) : 0}%`, icon: Building },
    { title: '공공 사업 사고', value: publicSectorIncidents.toLocaleString() + '건', description: `${totalAccidents > 0 ? ((publicSectorIncidents / totalAccidents) * 100).toFixed(1) : 0}%`, icon: Landmark },
    { title: '고비용 사업 사고', value: highCostIncidents.toLocaleString() + '건', description: '공사비 1,000억 이상', icon: DollarSign },
    { title: '고위험 사고', value: highRiskIncidents.toLocaleString() + '건', description: '사고위험지수 1.0 이상', icon: ShieldAlert },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <KpiCard
          key={index}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
        />
      ))}
    </div>
  );
}
