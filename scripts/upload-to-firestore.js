// This script reads your local incidents.json file and uploads it to your Firestore database.
// To run it, you must first have a serviceAccountKey.json file in the root directory.
// Then, use the command: npm run upload:firestore

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- Path to your service account key file ---
// This key gives the script admin privileges to bypass security rules.
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  console.error(
    'Error: `serviceAccountKey.json` not found in the root directory.'
  );
  console.error(
    'Please download it from your Firebase project settings (Service Accounts tab) and place it in the project root.'
  );
  process.exit(1);
}

// --- Your project ID from the service account key file ---
const projectId = serviceAccount.project_id;
if (!projectId) {
  console.error('Firebase project ID not found in service account key file.');
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: projectId,
});

const db = admin.firestore();

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

    const incidentsCollection = db.collection('incidents');
    const CHUNK_SIZE = 400; // Admin SDK can handle larger batches safely.
    const DELAY_MS = 1000;
    const totalChunks = Math.ceil(totalIncidents / CHUNK_SIZE);

    console.log(
      `Uploading in ${totalChunks} chunks of up to ${CHUNK_SIZE} documents each.`
    );

    for (let i = 0; i < totalChunks; i++) {
      const batch = db.batch();
      const chunk = incidents.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

      chunk.forEach((incident) => {
        const docRef = incidentsCollection.doc(incident.id);
        batch.set(docRef, incident);
      });

      await batch.commit();
      console.log(`Chunk ${i + 1}/${totalChunks} uploaded successfully.`);

      if (i < totalChunks - 1) {
        console.log(
          `Waiting for ${DELAY_MS / 1000} seconds before next chunk...`
        );
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log('🎉 All data uploaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during upload:', error);
    process.exit(1);
  }
}

uploadData();
