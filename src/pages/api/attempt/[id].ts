import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('attempts').doc(params.id!).get();
    if (!snap.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const data = snap.data()!;
    return new Response(JSON.stringify({
      id: snap.id,
      examId: data.examId || '',
      studentName: data.studentName || 'Anonymous',
      score: Number(data.score) || 0,
      correct: Number(data.correct) || 0,
      wrong: Number(data.wrong) || 0,
      skipped: Number(data.skipped) || 0,
      penalty: Number(data.penalty) || 0,
      total: Number(data.total) || 0,
      timeTaken: Number(data.timeTaken) || 0,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
