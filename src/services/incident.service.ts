import { promises as fs } from 'fs';
import path from 'path';
import type { Incident } from '@/lib/types';

interface RawIncident {
  '사건_Code': string;
  '사고명': string;
  '사고일시': string;
  '사업특성_구분': string;
  '사업특성_용도': string;
  '사업특성_공사비(억원미만)': string;
  '공종_대분류': string;
  '공종_중분류': string;
  '공종_작업': string;
  '사고객체_대분류': string;
  '사고객체_중분류': string;
  '사고원인-대분류': string;
  '사고원인-중분류': string;
  '사고원인-소분류': string;
  '사고원인_상세': string;
  '사고결과_대분류': string;
  '사고결과_상세': string;
  '사고피해_사망자수': number;
  '사고피해_부상자수': number;
  '금액(백만원)': number;
  '사고위험지수': number;
}

function cleanConstructionType(type: string): string {
  if (!type) return '기타';
  const cleaned = type.replace(/^[0-9]+\s*/, '').trim();
  return cleaned || '기타';
}

export async function getIncidents(): Promise<Incident[]> {
  const filePath = path.join(process.cwd(), 'data/incidents.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const rawIncidents: RawIncident[] = JSON.parse(fileContents);

    const incidents: Incident[] = rawIncidents.map(raw => ({
      id: raw['사건_Code'],
      name: raw['사고명'],
      dateTime: raw['사고일시'],
      projectOwner: raw['사업특성_구분'],
      projectType: raw['사업특성_용도'],
      projectCost: raw['사업특성_공사비(억원미만)'],
      constructionTypeMain: cleanConstructionType(raw['공종_대분류']),
      constructionTypeSub: cleanConstructionType(raw['공종_중분류']),
      workType: raw['공종_작업'],
      objectMain: raw['사고객체_대분류'],
      objectSub: raw['사고객체_중분류'],
      causeMain: raw['사고원인-대분류'],
      causeMiddle: raw['사고원인-중분류'],
      causeSub: raw['사고원인-소분류'],
      causeDetail: raw['사고원인_상세'],
      resultMain: raw['사고결과_대분류'],
      resultDetail: raw['사고결과_상세'],
      fatalities: Number(raw['사고피해_사망자수']) || 0,
      injuries: Number(raw['사고피해_부상자수']) || 0,
      costDamage: Number(raw['금액(백만원)']) || 0,
      riskIndex: Number(raw['사고위험지수']) || 0,
    }));

    return incidents;
  } catch (error) {
    console.error('Error reading or parsing incidents data:', error);
    return [];
  }
}
