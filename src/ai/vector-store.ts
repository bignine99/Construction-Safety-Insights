import { ai, embeddingModel } from './genkit';
import { ChromaClient } from 'chromadb';
import { z } from 'genkit';

const COLLECTION_NAME = 'construction_accidents';
const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

/**
 * ChromaDB에서 유사한 사고 사례를 검색하는 Retriever 정의
 */
export const accidentRetriever = ai.defineRetriever(
  {
    name: 'accidentRetriever',
    configSchema: z.object({
      limit: z.number().optional(),
    }),
  },
  async (query, config) => {
    try {
      const collection = await chromaClient.getCollection({
        name: COLLECTION_NAME,
      });

      // 1. 쿼리 텍스트를 임베딩으로 변환
      const embeddingResult = await ai.embed({
        model: embeddingModel,
        content: query.text(),
      });

      // 2. ChromaDB에서 유사 벡터 검색
      const results = await collection.query({
        queryEmbeddings: [embeddingResult],
        nResults: config?.limit || 10,
      });

      // 3. 결과를 Genkit Document 형식으로 변환하여 반환
      return {
        documents: results.documents[0].map((doc, i) => ({
          content: [{ text: doc || '' }],
          metadata: results.metadatas[0][i] || {},
        })),
      };
    } catch (error) {
      console.error('Error retrieving from ChromaDB:', error);
      return { documents: [] };
    }
  }
);

/**
 * 사고 데이터를 ChromaDB에 인덱싱하는 함수 (관리자용 스크립트에서 사용)
 */
export async function indexAccidents(incidents: any[]) {
  try {
    // 컬렉션 가져오기 또는 생성
    let collection;
    try {
      collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
    } catch {
      collection = await chromaClient.createCollection({ name: COLLECTION_NAME });
    }

    const batchSize = 100;
    for (let i = 0; i < incidents.length; i += batchSize) {
      const batch = incidents.slice(i, i + batchSize);
      
      // 텍스트 임베딩 생성
      const embeddings = await Promise.all(
        batch.map(item => 
          ai.embed({
            model: embeddingModel,
            content: `${item.name} ${item.causeDetail || ''}`,
          })
        )
      );

      // ChromaDB 저장
      await collection.add({
        ids: batch.map(item => item.id.toString()),
        embeddings: embeddings,
        metadatas: batch.map(item => ({
          cause: item.causeMain,
          result: item.resultMain,
          constructionType: item.constructionTypeMain,
        })),
        documents: batch.map(item => `${item.name} (원인: ${item.causeMain}, 결과: ${item.resultMain})`),
      });

      console.log(`Indexed ${i + batch.length} / ${incidents.length} items...`);
    }
    
    return true;
  } catch (error) {
    console.error('Indexing failed:', error);
    throw error;
  }
}
