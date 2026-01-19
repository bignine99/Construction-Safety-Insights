export interface Incident {
  id: string;
  name: string;
  dateTime: string;
  projectOwner: string; // '민간' or '공공'
  projectType: string;
  projectCost: string; // '50', '500', '1000', '1,000 ~'
  constructionTypeMain: string;
  constructionTypeSub: string;
  workType: string;
  objectMain: string;
  objectSub: string;
  causeMain: string;
  causeMiddle: string;
  causeSub: string;
  causeDetail: string;
  resultMain: string;
  resultDetail: string;
  fatalities: number;
  injuries: number;
  costDamage: number; // In 백만원
  riskIndex: number;
}

export interface AiAnalysis {
  analysisResults: string[];
  preventativeMeasures: string[];
  safetyInstructions: string[];
}

export interface SavedSolution extends AiAnalysis {
  id?: string;
  createdAt: number;
  incidentCount: number;
  title?: string;
}

export interface VisualAnalysisInput {
  prompt: string;
  photoDataUri: string | null;
}

export interface DashboardStats {
  totalAccidents: number;
  totalFatalities: number;
  totalInjuries: number;
  averageCostDamage: number;
  averageRiskIndex: number;
  annualData: { year: string; count: number }[];
  monthlyTrend: { month: number; accidents: number; fatalities: number }[];
  constructionTypeData: { name: string; value: number }[];
  objectSubtypeData: { name: string; count: number }[];
  causeSubtypeData: { name: string; count: number }[];
  resultMainData: { name: string; count: number }[];
  // 추가된 필드들
  workTypeRiskData: { name: string; riskIndex: number }[];
  causeResultMatrix: { cause: string; result: string; count: number }[];
  constructionSubtypeCount: Record<string, number>;
}
