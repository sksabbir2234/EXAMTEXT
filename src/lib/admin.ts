import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

let db: any;

if (!admin.apps.length) {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');

  raw = raw.trim();
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
  raw = raw.replace(/\\"/g, '"');
  if (!raw.startsWith('{')) raw = '{' + raw;
  if (!raw.endsWith('}')) raw = raw + '}';

  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('[Admin] Firebase Admin initialized');
}

db = admin.firestore();
export { db };
