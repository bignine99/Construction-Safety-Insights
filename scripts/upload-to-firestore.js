// This script reads your local incidents.json file and uploads it to your Firestore database.
// To run it, use the command: npm run upload:firestore

require('dotenv').config({ path: './.env' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Your web app's Firebase configuration from .env file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
    console.error("Firebase configuration is missing. Make sure your .env file is set up correctly.");
    process.exit(1);
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper functions to map raw JSON data to our Incident type
function cleanConstructionType(type) {
  if (!type) return '기타';
  const cleaned = type.replace(/^[0-9]+\s*/, '').trim();
  return cleaned || '기타';
}

function mapRawToIncident(raw) {
  const id = raw['사건_Code'] || `generated-${Math.random()}`;
  return {
    id: id,
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
  };
}

// Main upload function
async function uploadData() {
  try {
    console.log('Reading data file from data/incidents.json...');
    const filePath = path.join(__dirname, '../data/incidents.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawIncidents = JSON.parse(fileContent);

    if (!Array.isArray(rawIncidents) || rawIncidents.length === 0) {
      console.log('No data to upload or file is empty.');
      return;
    }

    const incidents = rawIncidents.map(mapRawToIncident);
    const totalIncidents = incidents.length;
    console.log(`Found ${totalIncidents} incidents to upload.`);

    const incidentsCollection = collection(db, 'incidents');
    const CHUNK_SIZE = 100; // Safe chunk size
    const DELAY_MS = 1500;   // Safe delay to avoid rate limiting
    const totalChunks = Math.ceil(totalIncidents / CHUNK_SIZE);
    
    console.log(`Uploading in ${totalChunks} chunks of up to ${CHUNK_SIZE} documents each.`);

    for (let i = 0; i < totalChunks; i++) {
      const batch = writeBatch(db);
      const chunk = incidents.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      
      chunk.forEach((incident) => {
        const docRef = doc(incidentsCollection, incident.id);
        batch.set(docRef, incident);
      });
      
      await batch.commit();
      console.log(`Chunk ${i + 1}/${totalChunks} uploaded successfully.`);
      
      if (i < totalChunks - 1) {
        console.log(`Waiting for ${DELAY_MS / 1000} seconds before next chunk...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log('🎉 All data uploaded successfully!');
    // The script will exit automatically when all async operations are done.
    process.exit(0);

  } catch (error) {
    console.error('An error occurred during upload:', error);
    process.exit(1);
  }
}

uploadData();
