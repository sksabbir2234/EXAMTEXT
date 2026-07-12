import type { APIRoute } from 'astro';
import { getAdminDb } from '../../lib/firebase-admin';

// Minimal anonymous leaderboard write with negative marking fields.
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as any;
    const db = getAdminDb();
    const ref = await db.collection('attempts').add({
      examId: body.examId,
      studentName: body.studentName || 'Anonymous',
      score: Number(body.score) || 0,
      correct: Number(body.correct) || 0,
      wrong: Number(body.wrong) || 0,
      skipped: Number(body.skipped) || 0,
      penalty: Number(body.penalty) || 0,
      total: Number(body.total) || 0,
      timeTaken: Number(body.timeTaken) || 0,
      createdAt: new Date(),
    });
    return new Response(JSON.stringify({ id: ref.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
