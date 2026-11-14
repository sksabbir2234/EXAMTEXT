import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { getSessionToken, isValidSession } from '../../../../lib/auth';

// The exam page renders these fields into HTML templates. Escape HTML metacharacters
// before returning them so options like "<br>" are displayed as text instead of
// being parsed as elements (which can also break the remaining question markup).
function escapeHtml(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const GET: APIRoute = async (ctx) => {
  try {
    const examId = ctx.params.id;
    if (!examId) return new Response(JSON.stringify({ error: 'Missing exam id' }), { status: 400 });

    const db = getAdminDb();
    const examDoc = await db.collection('exams').doc(examId).get();
    if (!examDoc.exists) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    if (!examDoc.data()?.published) {
      const token = getSessionToken(ctx);
      const isAuthed = await isValidSession(token);
      if (!isAuthed) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      }
    }

    const snap = await db.collection('exams').doc(examId).collection('questions').orderBy('order').get();
    const questions = snap.docs.map(d => {
      const question = { id: d.id, ...d.data() };
      return {
        ...question,
        questionText: escapeHtml(question.questionText),
        options: Array.isArray(question.options) ? question.options.map(escapeHtml) : question.options,
        explanation: escapeHtml(question.explanation),
      };
    });
    return new Response(JSON.stringify(questions), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
