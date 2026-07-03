import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function initAdmin() {
  if (admin.apps.length) {
    db = admin.firestore();
    return;
  }

  let raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
  }

  // Vercel sometimes wraps the value in extra quotes
  raw = raw.trim();
  if (raw.startsWith('"') && raw.endsWith('"')) {
    raw = raw.slice(1, -1);
  }
  // Unescape escaped quotes
  raw = raw.replace(/\\"/g, '"');

  try {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('[Admin] Firebase Admin initialized OK');
  } catch (e: any) {
    console.error('[Admin] Parse error:', e.message);
    throw e;
  }

  db = admin.firestore();
}

initAdmin();
export { db };
