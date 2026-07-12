import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async (ctx) => {
  if (!await checkAuth(ctx)) return new Response('Unauthorized', { status: 401 });

  const db = getAdminDb();
  const snapshot = await db.collection('exams').get();
  const batch = db.batch();
  let count = 0;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if ('order' in data) {
      batch.update(doc.ref, { order: FieldValue.delete() });
      count++;
    }
  });

  await batch.commit();
  return new Response(JSON.stringify({ ok: true, cleaned: count }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
