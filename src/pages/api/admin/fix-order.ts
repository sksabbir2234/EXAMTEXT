import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
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
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
