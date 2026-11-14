import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('attempts').where('examId', '==', params.examId).orderBy('score', 'desc').limit(50).get();
    const attempts = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        studentName: data.studentName || 'Anonymous',
        score: Number(data.score) || 0,
        total: Number(data.total) || 0,
        timeTaken: Number(data.timeTaken) || 0,
      };
    });
    return new Response(JSON.stringify(attempts), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
