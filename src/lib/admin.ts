import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || import.meta.env.FIREBASE_SERVICE_ACCOUNT || '';
  
  if (!raw) {
    console.error('[Admin] FIREBASE_SERVICE_ACCOUNT is empty/undefined');
  } else {
    try {
      const serviceAccount = JSON.parse(raw);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('[Admin] Firebase Admin initialized OK');
    } catch (e: any) {
      console.error('[Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }
}

db = admin.firestore();
export { db };
