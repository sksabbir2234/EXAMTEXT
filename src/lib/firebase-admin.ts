import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (_db) return _db;

  const projectId = import.meta.env.FIREBASE_PROJECT_ID;
  const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = import.meta.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      `Firebase Admin: missing env vars. Have: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKeyRaw}`
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  if (!getApps().length) {
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    _app = getApps()[0];
  }

  _db = getFirestore(_app!);
  return _db;
}
