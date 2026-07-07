import type { APIRoute } from 'astro';
import { getAdminDb } from '../../lib/firebase-admin';

const WRONG_PER_PENALTY = 4;
const PENALTY_MARKS = 1;

function computeFinalScore(correct: number, wrong: number, total: number): number {
  const penalty = Math.floor((wrong || 0) / WRONG_PER_PENALTY) * PENALTY_MARKS;
  return Math.max(0, (correct || 0) - penalty);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as any;
    const { examId, studentName, answers } = body;
    const total = Number(body.total) || 0;

    let correct = Number(body.correct);
    let wrong = Number(body.wrong);

    // Derive from answers if not supplied (answers keyed by original question index)
    if ((!correct && correct !== 0) || (!wrong && wrong !== 0)) {
      const questions = body.questions;
      if (Array.isArray(questions)) {
        correct = 0;
        wrong = 0;
        questions.forEach((q: any, i: number) => {
          const sel = answers?.[i];
          if (sel === undefined || sel === null) return;
          if (sel === q.correctOptionIndex) correct++;
          else wrong++;
        });
      }
    }

    const finalScore = typeof body.score === 'number'
      ? body.score
      : computeFinalScore(correct, wrong, total);

    const db = getAdminDb();
    const ref = await db.collection('attempts').add({
      examId,
      studentName,
      score: finalScore,
      correct,
      wrong,
      total,
      penalty: Math.max(0, (correct - finalScore)),
      answers,
      timeTaken: Number(body.timeTaken) || 0,
      createdAt: new Date(),
    });
    return new Response(JSON.stringify({ id: ref.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
