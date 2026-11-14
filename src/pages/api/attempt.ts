import type { APIRoute } from 'astro';
import { getAdminDb } from '../../lib/firebase-admin';

// Minimal anonymous leaderboard write with negative marking fields.
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as any;
    const db = getAdminDb();

    // Sanitize and clamp student name (max 50 chars, no HTML tags)
    const rawName = typeof body.studentName === 'string' ? body.studentName.trim() : '';
    const studentName = rawName.replace(/<[^>]*>/g, '').trim().slice(0, 50) || 'Anonymous';
    const examId = typeof body.examId === 'string' ? body.examId.trim().slice(0, 100) : '';

    if (!examId) {
      return new Response(JSON.stringify({ error: 'Missing examId' }), { status: 400 });
    }

    const ref = await db.collection('attempts').add({
      examId,
      studentName,
      score: Number(body.score) || 0,
      correct: Math.max(0, Number(body.correct) || 0),
      wrong: Math.max(0, Number(body.wrong) || 0),
      skipped: Math.max(0, Number(body.skipped) || 0),
      penalty: Math.max(0, Number(body.penalty) || 0),
      total: Math.max(0, Number(body.total) || 0),
      timeTaken: Math.max(0, Number(body.timeTaken) || 0),
      createdAt: new Date(),
    });
    return new Response(JSON.stringify({ id: ref.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
