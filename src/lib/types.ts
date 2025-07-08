export interface Incident {
  id: string;
  date: string;
  projectType: string;
  projectCost: number;
  location: string;
  severityIndex: number;
  causeMain: string;
  causeSpecific: string;
  contractor: string;
}

export interface AiAnalysis {
  themes: string[];
  preventativeMeasures: string[];
}
