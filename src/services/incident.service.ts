import type { Incident } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getIncidents(): Promise<Incident[]> {
  try {
    const incidentsCollection = collection(db, 'incidents');
    // For debugging, use a simpler query first, then sort in code.
    const querySnapshot = await getDocs(incidentsCollection);

    if (querySnapshot.empty) {
      console.log('No incidents found in Firestore. Returning empty array.');
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
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      } catch (e) {
        return 0;
      }
    });

    return incidents;
  } catch (error) {
    console.error('Error getting incidents from Firestore:', error);
    return [];
  }
}
