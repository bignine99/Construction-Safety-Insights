import type { Incident } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function getIncidents(): Promise<Incident[]> {
  try {
    const incidentsCollection = collection(db, 'incidents');
    const q = query(incidentsCollection, orderBy('dateTime', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No incidents found in Firestore. Returning empty array.');
      return [];
    }

    const incidents: Incident[] = querySnapshot.docs.map(doc => {
      // Firestore는 doc.data()가 Incident 타입임을 보장하지 않으므로,
      // 필요한 모든 필드를 명시적으로 캐스팅하거나 확인하는 것이 좋습니다.
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
    
    return incidents;
  } catch (error) {
    console.error('Error getting incidents from Firestore:', error);
    // Firestore에서 오류 발생 시 빈 배열을 반환하여 앱의 나머지 부분이 중단되지 않도록 합니다.
    return [];
  }
}
