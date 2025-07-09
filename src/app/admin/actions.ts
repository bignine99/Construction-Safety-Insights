'use server';

import { db } from '@/lib/firebase';
import type { Incident } from '@/lib/types';
import {
  collection,
  writeBatch,
  doc,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';

// 한 번에 업로드할 청크(데이터 묶음)
export async function uploadIncidentChunk(
  chunk: Incident[]
): Promise<{ success: boolean; message: string }> {
  if (!chunk || chunk.length === 0) {
    return { success: false, message: '업로드할 데이터가 없습니다.' };
  }

  const incidentsCollection = collection(db, 'incidents');
  const batch = writeBatch(db);

  chunk.forEach(incident => {
    const docRef = doc(incidentsCollection, incident.id);
    batch.set(docRef, incident);
  });

  try {
    await batch.commit();
    return { success: true, message: `${chunk.length}개의 데이터가 성공적으로 업로드되었습니다.` };
  } catch (error) {
    console.error('청크 업로드 실패:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `청크 업로드 중 오류 발생: ${errorMessage}`,
    };
  }
}


// 모든 사고 데이터를 삭제하는 함수
export async function deleteAllIncidents(): Promise<{
  success: boolean;
  message: string;
}> {
  const incidentsCollection = collection(db, 'incidents');
  try {
    let deletedCount = 0;
    while (true) {
      const q = query(incidentsCollection, limit(500));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        break; // 삭제할 문서가 더 이상 없음
      }

      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      deletedCount += querySnapshot.size;
    }

    if (deletedCount === 0) {
      return { success: true, message: '삭제할 데이터가 없습니다.' };
    }

    return {
      success: true,
      message: `총 ${deletedCount}개의 사고 데이터가 성공적으로 삭제되었습니다.`,
    };
  } catch (error) {
    console.error('전체 데이터 삭제 실패:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `전체 데이터 삭제 중 오류 발생: ${errorMessage}`,
    };
  }
}
