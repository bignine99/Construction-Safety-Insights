// scripts/migrate-to-mysql.js
const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

// Firebase 설정 (환경 변수 사용 권장)
const firebaseConfig = {
  projectId: "accidentdb01",
};

if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

const db = admin.firestore();

async function migrate() {
  console.log('🚀 마이그레이션 시작...');

  try {
    // 1. Incidents 이전
    console.log('📦 Incidents 데이터 가져오는 중...');
    const incidentsSnapshot = await db.collection('incidents').get();
    const incidentsData = incidentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📝 ${incidentsData.length}개의 Incident 데이터를 MySQL에 저장 중...`);
    for (const item of incidentsData) {
      await prisma.incident.create({
        data: {
          name: item.name || '',
          dateTime: item.dateTime || '',
          projectOwner: item.projectOwner || '기타',
          projectType: item.projectType || '기타',
          projectCost: item.projectCost || '기타',
          constructionTypeMain: item.constructionTypeMain || '기타',
          constructionTypeSub: item.constructionTypeSub || '기타',
          workType: item.workType || '기타',
          objectMain: item.objectMain || '기타',
          objectSub: item.objectSub || '기타',
          causeMain: item.causeMain || '기타',
          causeMiddle: item.causeMiddle || '기타',
          causeSub: item.causeSub || '기타',
          causeDetail: item.causeDetail || '',
          resultMain: item.resultMain || '기타',
          resultDetail: item.resultDetail || '',
          fatalities: Number(item.fatalities) || 0,
          injuries: Number(item.injuries) || 0,
          costDamage: Number(item.costDamage) || 0,
          riskIndex: Number(item.riskIndex) || 0,
        }
      });
    }

    // 2. Solutions 이전
    console.log('📦 Solutions 데이터 가져오는 중...');
    const solutionsSnapshot = await db.collection('solutions').get();
    const solutionsData = solutionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📝 ${solutionsData.length}개의 Solution 데이터를 MySQL에 저장 중...`);
    for (const item of solutionsData) {
      await prisma.solution.create({
        data: {
          title: item.title || null,
          analysisResults: item.analysisResults || [],
          preventativeMeasures: item.preventativeMeasures || [],
          safetyInstructions: item.safetyInstructions || [],
          incidentCount: Number(item.incidentCount) || 0,
          createdAt: BigInt(item.createdAt || Date.now()),
        }
      });
    }

    console.log('✅ 마이그레이션 완료!');
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
