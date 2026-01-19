// scripts/seed-from-json.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function cleanConstructionType(type) {
  if (!type) return '기타';
  const cleaned = type.replace(/^[0-9]+\s*/, '').trim();
  return cleaned || '기타';
}

function mapRawToIncident(raw) {
  return {
    name: raw['사고명'] || '',
    dateTime: String(raw['사고일시'] || ''),
    projectOwner: raw['사업특성_구분'] || '기타',
    projectType: raw['사업특성_용도'] || '기타',
    projectCost: raw['사업특성_공사비(억원미만)'] || '기타',
    constructionTypeMain: cleanConstructionType(raw['공종_대분류']),
    constructionTypeSub: cleanConstructionType(raw['공종_중분류']),
    workType: raw['공종_작업'] || '기타',
    objectMain: raw['사고객체_대분류'] || '기타',
    objectSub: raw['사고객체_중분류'] || '기타',
    causeMain: raw['사고원인-대분류'] || '기타',
    causeMiddle: raw['사고원인-중분류'] || '기타',
    causeSub: raw['사고원인-소분류'] || '기타',
    causeDetail: raw['사고원인_상세'] || '',
    resultMain: raw['사고결과_대분류'] || '기타',
    resultDetail: raw['사고결과_상세'] || '',
    fatalities: Number(raw['사고피해_사망자수']) || 0,
    injuries: Number(raw['사고피해_부상자수']) || 0,
    costDamage: Number(raw['금액(백만원)']) || 0,
    riskIndex: Number(raw['사고위험지수']) || 0,
  };
}

async function seed() {
  try {
    console.log('Reading data file from data/incidents.json...');
    const filePath = path.join(__dirname, '../data/incidents.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawIncidents = JSON.parse(fileContent);

    if (!Array.isArray(rawIncidents) || rawIncidents.length === 0) {
      console.log('No data to seed.');
      return;
    }

    const totalIncidents = rawIncidents.length;
    console.log(`Found ${totalIncidents} incidents in JSON. Preparing to seed MySQL...`);

    // Split into chunks to avoid memory/timeout issues
    const CHUNK_SIZE = 1000;
    const totalChunks = Math.ceil(totalIncidents / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = rawIncidents.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const dataToInsert = chunk.map(mapRawToIncident);

      await prisma.incident.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      });

      console.log(`Chunk ${i + 1}/${totalChunks} inserted.`);
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
