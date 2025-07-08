'use server';

import { analyzeAccidentThemes } from '@/ai/flows/analyze-accident-themes';
import type { AiAnalysis } from '@/lib/types';

export async function getAiAnalysis(
  accidentDescriptions: string[]
): Promise<AiAnalysis> {
  if (!accidentDescriptions || accidentDescriptions.length === 0) {
    return {
      themes: [],
      preventativeMeasures: ['분석할 사고 데이터가 없습니다.'],
    };
  }

  try {
    const result = await analyzeAccidentThemes({ accidentDescriptions });
    return result;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      themes: [],
      preventativeMeasures: ['AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'],
    };
  }
}
