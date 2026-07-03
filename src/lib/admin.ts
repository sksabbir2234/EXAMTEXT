import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function initAdmin() {
  if (admin.apps.length) {
    db = admin.firestore();
    return;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  
  if (!raw) {
    console.error('[Admin] FIREBASE_SERVICE_ACCOUNT env var is EMPTY or UNDEFINED');
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
  }

  try {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('[Admin] Firebase Admin initialized successfully');
  } catch (e: any) {
    console.error('[Admin] Failed to initialize Firebase Admin:', e.message);
    throw e;
  }

  db = admin.firestore();
}

initAdmin();
export { db };
