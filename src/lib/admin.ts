import admin from 'firebase-admin';

let _db: admin.firestore.Firestore | null = null;

function initDb(): admin.firestore.Firestore {
  if (_db) return _db;

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
  }

  _db = admin.firestore();
  return _db;
}

export const db = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return (initDb() as any)[prop];
  }
});
