import type { APIRoute } from 'astro';
import { getAdminDb } from '../../lib/firebase-admin';

// Minimal anonymous leaderboard write. No detailed attempt/answer data is
// persisted server-side — full history lives in the student's browser (localStorage).
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as any;
    const db = getAdminDb();
    const ref = await db.collection('attempts').add({
      examId: body.examId,
      studentName: body.studentName || 'Anonymous',
      score: Number(body.score) || 0,
      total: Number(body.total) || 0,
      timeTaken: Number(body.timeTaken) || 0,
      createdAt: new Date(),
    });
    return new Response(JSON.stringify({ id: ref.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
