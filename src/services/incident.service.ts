// src/services/incident.service.ts
import type { Incident, DashboardStats } from '@/lib/types';
import prisma from '@/lib/prisma';
import { parseIncidentDate } from '@/lib/utils';

export interface IncidentFilters {
  projectOwner?: string[];
  projectType?: string[];
  constructionTypeMain?: string[];
  constructionTypeSub?: string[];
  objectMain?: string[];
  causeMain?: string[];
  resultMain?: string[];
}

/**
 * 필터 조건을 Prisma where 절로 변환합니다.
 */
function buildWhereClause(filters: IncidentFilters) {
  const where: any = {};
  if (filters.projectOwner?.length) where.projectOwner = { in: filters.projectOwner };
  if (filters.projectType?.length) where.projectType = { in: filters.projectType };
  if (filters.constructionTypeMain?.length) where.constructionTypeMain = { in: filters.constructionTypeMain };
  if (filters.constructionTypeSub?.length) where.constructionTypeSub = { in: filters.constructionTypeSub };
  if (filters.objectMain?.length) where.objectMain = { in: filters.objectMain };
  if (filters.causeMain?.length) where.causeMain = { in: filters.causeMain };
  if (filters.resultMain?.length) where.resultMain = { in: filters.resultMain };
  return where;
}

export async function getIncidents(): Promise<Incident[]> {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return incidents.map(data => ({
      id: data.id.toString(),
      name: data.name,
      dateTime: data.dateTime,
      projectOwner: data.projectOwner,
      projectType: data.projectType,
      projectCost: data.projectCost,
      constructionTypeMain: data.constructionTypeMain,
      constructionTypeSub: data.constructionTypeSub,
      workType: data.workType,
      objectMain: data.objectMain,
      objectSub: data.objectSub,
      causeMain: data.causeMain,
      causeMiddle: data.causeMiddle,
      causeSub: data.causeSub,
      causeDetail: data.causeDetail,
      resultMain: data.resultMain,
      resultDetail: data.resultDetail,
      fatalities: data.fatalities,
      injuries: data.injuries,
      costDamage: data.costDamage,
      riskIndex: data.riskIndex,
    }));
  } catch (error) {
    console.error('Error getting incidents from MySQL:', error);
    return [];
  }
}

/**
 * 페이지네이션이 적용된 사고 목록을 가져옵니다.
 */
export async function getPaginatedIncidents(
  filters: IncidentFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<{ incidents: Incident[]; totalCount: number }> {
  try {
    const where = buildWhereClause(filters);
    const skip = (page - 1) * pageSize;

    const [incidents, totalCount] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      incidents: incidents.map(data => ({
        id: data.id.toString(),
        name: data.name,
        dateTime: data.dateTime,
        projectOwner: data.projectOwner,
        projectType: data.projectType,
        projectCost: data.projectCost,
        constructionTypeMain: data.constructionTypeMain,
        constructionTypeSub: data.constructionTypeSub,
        workType: data.workType,
        objectMain: data.objectMain,
        objectSub: data.objectSub,
        causeMain: data.causeMain,
        causeMiddle: data.causeMiddle,
        causeSub: data.causeSub,
        causeDetail: data.causeDetail,
        resultMain: data.resultMain,
        resultDetail: data.resultDetail,
        fatalities: data.fatalities,
        injuries: data.injuries,
        costDamage: data.costDamage,
        riskIndex: data.riskIndex,
      })),
      totalCount,
    };
  } catch (error) {
    console.error('Error getting paginated incidents:', error);
    return { incidents: [], totalCount: 0 };
  }
}

/**
 * 서버 사이드에서 데이터를 집계하여 대시보드에 필요한 통계 정보를 반환합니다.
 */
export async function getDashboardStats(filters: IncidentFilters): Promise<DashboardStats> {
  try {
    const where = buildWhereClause(filters);

    // 1. 기본 메트릭 집계
    const aggregations = await prisma.incident.aggregate({
      where,
      _count: { id: true },
      _sum: { fatalities: true, injuries: true, costDamage: true, riskIndex: true },
    });

    const totalAccidents = aggregations._count.id || 0;
    
    // 2. 항목별 GroupBy 집계 (병렬 처리)
    const [
      constructionGroups, 
      objectGroups, 
      causeGroups, 
      resultGroups,
      workTypeGroups,
      causeResultGroups,
      allIncidentsForDates
    ] = await Promise.all([
      prisma.incident.groupBy({
        by: ['constructionTypeSub'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
      prisma.incident.groupBy({
        by: ['objectSub'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.incident.groupBy({
        by: ['causeMiddle'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.incident.groupBy({
        by: ['resultMain'],
        where,
        _count: { id: true },
      }),
      prisma.incident.groupBy({
        by: ['workType'],
        where,
        _sum: { riskIndex: true },
        orderBy: { _sum: { riskIndex: 'desc' } },
        take: 10,
      }),
      prisma.incident.groupBy({
        by: ['causeMain', 'resultMain'],
        where,
        _count: { id: true },
      }),
      prisma.incident.findMany({
        where,
        select: { dateTime: true, fatalities: true },
      }),
    ]);

    // 날짜 기반 집계 처리
    const annualMap: Record<string, number> = {};
    const monthlyMap: Record<number, { accidents: number; fatalities: number }> = {};
    for (let i = 1; i <= 12; i++) monthlyMap[i] = { accidents: 0, fatalities: 0 };

    allIncidentsForDates.forEach(inc => {
      const date = parseIncidentDate(inc.dateTime);
      if (date && !isNaN(date.getTime())) {
        const year = date.getFullYear().toString();
        annualMap[year] = (annualMap[year] || 0) + 1;
        
        const month = date.getMonth() + 1;
        monthlyMap[month].accidents++;
        monthlyMap[month].fatalities += inc.fatalities;
      }
    });

    const constructionSubtypeCount: Record<string, number> = {};
    constructionGroups.forEach(g => {
      constructionSubtypeCount[g.constructionTypeSub] = g._count.id;
    });

    return {
      totalAccidents,
      totalFatalities: aggregations._sum.fatalities || 0,
      totalInjuries: aggregations._sum.injuries || 0,
      averageCostDamage: totalAccidents > 0 ? (aggregations._sum.costDamage || 0) / totalAccidents : 0,
      averageRiskIndex: totalAccidents > 0 ? (aggregations._sum.riskIndex || 0) / totalAccidents : 0,
      annualData: Object.entries(annualMap)
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year)),
      monthlyTrend: Object.entries(monthlyMap)
        .map(([month, data]) => ({ month: Number(month), ...data })),
      constructionTypeData: constructionGroups.map(g => ({ name: g.constructionTypeSub, value: g._count.id })),
      objectSubtypeData: objectGroups.map(g => ({ name: g.objectSub, count: g._count.id })),
      causeSubtypeData: causeGroups.map(g => ({ name: g.causeMiddle, count: g._count.id })),
      resultMainData: resultGroups.map(g => ({ name: g.resultMain, count: g._count.id })),
      workTypeRiskData: workTypeGroups.map(g => ({ name: g.workType, riskIndex: g._sum.riskIndex || 0 })),
      causeResultMatrix: causeResultGroups.map(g => ({ cause: g.causeMain, result: g.resultMain, count: g._count.id })),
      constructionSubtypeCount,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}

/**
 * 필터 사이드바에 필요한 고유 값들을 가져옵니다.
 */
export async function getFilterOptions() {
  try {
    const [
      projectOwners,
      projectTypes,
      constructionTypeMains,
      constructionTypeSubs,
      objectMains,
      causeMains,
      resultMains
    ] = await Promise.all([
      prisma.incident.findMany({ select: { projectOwner: true }, distinct: ['projectOwner'] }),
      prisma.incident.findMany({ select: { projectType: true }, distinct: ['projectType'] }),
      prisma.incident.findMany({ select: { constructionTypeMain: true }, distinct: ['constructionTypeMain'] }),
      prisma.incident.findMany({ select: { constructionTypeSub: true }, distinct: ['constructionTypeSub'] }),
      prisma.incident.findMany({ select: { objectMain: true }, distinct: ['objectMain'] }),
      prisma.incident.findMany({ select: { causeMain: true }, distinct: ['causeMain'] }),
      prisma.incident.findMany({ select: { resultMain: true }, distinct: ['resultMain'] }),
    ]);

    return {
      projectOwners: projectOwners.map(i => i.projectOwner).filter(Boolean),
      projectTypes: projectTypes.map(i => i.projectType).filter(Boolean),
      constructionTypeMains: constructionTypeMains.map(i => i.constructionTypeMain).filter(Boolean),
      constructionTypeSubs: constructionTypeSubs.map(i => i.constructionTypeSub).filter(Boolean),
      objectMains: objectMains.map(i => i.objectMain).filter(Boolean),
      causeMains: causeMains.map(i => i.causeMain).filter(Boolean),
      resultMains: resultMains.map(i => i.resultMain).filter(Boolean),
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      projectOwners: [],
      projectTypes: [],
      constructionTypeMains: [],
      constructionTypeSubs: [],
      objectMains: [],
      causeMains: [],
      resultMains: [],
    };
  }
}
