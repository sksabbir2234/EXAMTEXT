import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const db = getAdminDb();
    const subSnap = await db.collection('subjects').get();
    const subjects = [];
    for (const subDoc of subSnap.docs) {
      const examSnap = await db.collection('exams').where('subjectId', '==', subDoc.id).get();
      subjects.push({ id: subDoc.id, ...subDoc.data(), exams: examSnap.docs.map(e => ({ id: e.id, ...e.data() })) });
    }
    return new Response(JSON.stringify(subjects), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[Admin All] Error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
