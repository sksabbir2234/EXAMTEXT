import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';

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

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('exams').doc(params.id!).collection('questions').orderBy('order').get();
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
