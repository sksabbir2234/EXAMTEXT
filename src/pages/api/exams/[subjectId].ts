import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('exams').where('subjectId', '==', params.subjectId).where('published', '==', true).get();
    const exams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    exams.sort((a, b) => {
      const ta = a.createdAt?._seconds || a.createdAt?.seconds || 0;
      const tb = b.createdAt?._seconds || b.createdAt?.seconds || 0;
      return ta - tb;
    });
    return new Response(JSON.stringify(exams), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
