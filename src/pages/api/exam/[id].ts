import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { getSessionToken, isValidSession } from '../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('exams').doc(ctx.params.id!).get();
    if (!snap.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const exam: any = { id: snap.id, ...snap.data() };

    if (!exam.published) {
      const token = getSessionToken(ctx);
      const isAuthed = await isValidSession(token);
      if (!isAuthed) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      }
    }

    try {
      const subSnap = await db.collection('subjects').doc(exam.subjectId).get();
      if (subSnap.exists) exam.subjectName = subSnap.data()!.name;
    } catch {}
    return new Response(JSON.stringify(exam), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
