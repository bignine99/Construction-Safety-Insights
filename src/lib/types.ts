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

export interface VisualAnalysisInput {
  prompt: string;
  photoDataUri: string | null;
}
