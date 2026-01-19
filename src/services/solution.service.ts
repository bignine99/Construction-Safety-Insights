// src/services/solution.service.ts
import prisma from '@/lib/prisma';
import type { SavedSolution, AiAnalysis } from '@/lib/types';

/**
 * AI가 생성한 솔루션을 MySQL에 저장합니다.
 */
export async function saveSolution(solution: Omit<SavedSolution, 'id' | 'createdAt'>): Promise<string> {
  try {
    const created = await prisma.solution.create({
      data: {
        title: solution.title,
        analysisResults: solution.analysisResults,
        preventativeMeasures: solution.preventativeMeasures,
        safetyInstructions: solution.safetyInstructions,
        incidentCount: solution.incidentCount,
        createdAt: BigInt(Date.now()),
      },
    });
    return created.id.toString();
  } catch (error) {
    console.error('Error saving solution to MySQL:', error);
    throw error;
  }
}

/**
 * 최근 저장된 솔루션 목록을 가져옵니다.
 */
export async function getRecentSolutions(maxResults: number = 5): Promise<SavedSolution[]> {
  try {
    const solutions = await prisma.solution.findMany({
      orderBy: {
        id: 'desc',
      },
      take: maxResults,
    });

    return solutions.map(doc => ({
      id: doc.id.toString(),
      title: doc.title || undefined,
      analysisResults: doc.analysisResults as string[],
      preventativeMeasures: doc.preventativeMeasures as string[],
      safetyInstructions: doc.safetyInstructions as string[],
      incidentCount: doc.incidentCount,
      createdAt: Number(doc.createdAt),
    } as SavedSolution));
  } catch (error) {
    console.error('Error getting recent solutions from MySQL:', error);
    return [];
  }
}
