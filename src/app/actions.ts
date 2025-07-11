'use server';

import { analyzeAccidentThemes } from '@/ai/flows/analyze-accident-themes';
import { performVisualAnalysis } from '@/ai/flows/perform-visual-analysis';
import type { AiAnalysis, VisualAnalysisInput } from '@/lib/types';

export async function getAiAnalysis(
  accidentDescriptions: string[]
): Promise<AiAnalysis> {
  if (!accidentDescriptions || accidentDescriptions.length === 0) {
    return {
      analysisResults: ['분석할 사고 데이터가 없습니다.'],
      preventativeMeasures: [],
      safetyInstructions: [],
    };
  }

  try {
    const result = await analyzeAccidentThemes({ accidentDescriptions });
    return result;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      analysisResults: ['AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'],
      preventativeMeasures: [],
      safetyInstructions: [],
    };
  }
}

export async function performVisualAnalysisAction(input: VisualAnalysisInput): Promise<{ stream: AsyncGenerator<string> }> {
  const stream = await performVisualAnalysis(input);
  return { stream };
}
