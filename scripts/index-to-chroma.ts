// scripts/index-to-chroma.ts
import { PrismaClient } from '@prisma/client';
import { indexAccidents } from '../src/ai/vector-store';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log('🚀 네이버 클라우드 MySQL에서 데이터를 가져오는 중...');
  const incidents = await prisma.incident.findMany();
  
  console.log(`📦 총 ${incidents.length}건의 데이터를 확인했습니다. ChromaDB 인덱싱을 시작합니다...`);
  
  try {
    await indexAccidents(incidents);
    console.log('✅ 모든 데이터가 ChromaDB에 성공적으로 인덱싱되었습니다!');
  } catch (error) {
    console.error('❌ 인덱싱 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
