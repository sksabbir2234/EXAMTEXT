import type { APIRoute } from 'astro';
import { db } from '../../lib/admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { examId, studentName, score, total, answers, timeTaken } = await request.json();
    const ref = await db.collection('attempts').add({
      examId, studentName, score, total, answers, timeTaken, createdAt: new Date()
    });
    return new Response(JSON.stringify({ id: ref.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
