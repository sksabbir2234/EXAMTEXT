import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('exams').doc(params.id!).get();
    if (!snap.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const exam: any = { id: snap.id, ...snap.data() };
    try {
      const subSnap = await db.collection('subjects').doc(exam.subjectId).get();
      if (subSnap.exists) exam.subjectName = subSnap.data()!.name;
    } catch {}
    return new Response(JSON.stringify(exam), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
