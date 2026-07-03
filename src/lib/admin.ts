import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: any;

if (getApps().length === 0) {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');

  raw = raw.trim();
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
  raw = raw.replace(/\\"/g, '"');
  if (!raw.startsWith('{')) raw = '{' + raw;
  if (!raw.endsWith('}')) raw = raw + '}';

  const serviceAccount = JSON.parse(raw);
  initializeApp({ credential: cert(serviceAccount) });
  console.log('[Admin] Firebase Admin initialized');
}

db = getFirestore();
export { db };
