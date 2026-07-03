import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(import.meta.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) {
    console.error('Firebase Admin init error:', e);
  }
}

db = admin.firestore();
export { db };
