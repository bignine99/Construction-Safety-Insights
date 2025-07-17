// src/services/incident.service.ts
import type { Incident } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore';

export interface IncidentFilters {
  projectOwner?: string[];
  projectType?: string[];
  constructionTypeMain?: string[];
  constructionTypeSub?: string[];
  objectMain?: string[];
  causeMain?: string[];
  resultMain?: string[];
}


export async function getIncidents(): Promise<Incident[]> {
  try {
    // 환경 변수에서 컬렉션 이름을 가져옵니다. 기본값은 'incidents' 입니다.
    const collectionName = process.env.NEXT_PUBLIC_FIRESTORE_COLLECTION || 'incidents';
    const incidentsCollection = collection(db, collectionName);
    
    const q = query(incidentsCollection);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`Warning: No documents found in collection '${collectionName}'.`);
      return [];
    }

    const incidents: Incident[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        dateTime: data.dateTime || '',
        projectOwner: data.projectOwner || '기타',
        projectType: data.projectType || '기타',
        projectCost: data.projectCost || '기타',
        constructionTypeMain: data.constructionTypeMain || '기타',
        constructionTypeSub: data.constructionTypeSub || '기타',
        workType: data.workType || '기타',
        objectMain: data.objectMain || '기타',
        objectSub: data.objectSub || '기타',
        causeMain: data.causeMain || '기타',
        causeMiddle: data.causeMiddle || '기타',
        causeSub: data.causeSub || '기타',
        causeDetail: data.causeDetail || '',
        resultMain: data.resultMain || '기타',
        resultDetail: data.resultDetail || '',
        fatalities: Number(data.fatalities) || 0,
        injuries: Number(data.injuries) || 0,
        costDamage: Number(data.costDamage) || 0,
        riskIndex: Number(data.riskIndex) || 0,
      } as Incident;
    });
    
    // Sort incidents by date descending in the code
    incidents.sort((a, b) => {
      try {
        // Handle different date formats (serial vs string)
        const dateA = typeof a.dateTime === 'number' ? a.dateTime : new Date(a.dateTime).getTime();
        const dateB = typeof b.dateTime === 'number' ? b.dateTime : new Date(b.dateTime).getTime();
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });

    return incidents;
  } catch (error) {
    console.error('Error getting incidents from Firestore:', error);
    // Return empty array on error to prevent app crash
    return [];
  }
}
