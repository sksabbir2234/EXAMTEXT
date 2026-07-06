import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';

function validateQuestions(questions: any[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push('questions must be a non-empty array');
    return errors;
  }
  questions.forEach((q, i) => {
    const n = i + 1;
    if (!q.questionText || typeof q.questionText !== 'string') errors.push(`Q${n}: missing questionText`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`Q${n}: options must have ≥2 items`);
    if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0 || (Array.isArray(q.options) && q.correctOptionIndex >= q.options.length)) {
      errors.push(`Q${n}: correctOptionIndex out of range`);
    }
  });
  return errors;
}

async function uploadSingleExam(data: any, db: any): Promise<{ id: string; warning?: string }> {
  if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
    throw new Error('subject is required');
  }
  if (!data.examTitle || typeof data.examTitle !== 'string' || !data.examTitle.trim()) {
    throw new Error('examTitle is required');
  }
  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('questions must be a non-empty array');
  }

  const questionErrors = validateQuestions(data.questions);
  if (questionErrors.length > 0) {
    throw new Error('Validation failed: ' + questionErrors.join('; '));
  }

  const slug = data.subject.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

  let slugWarning: string | null = null;
  const existing = await db.collection('subjects').doc(slug).get();
  if (existing.exists && existing.data()!.name !== data.subject.trim()) {
    slugWarning = `Slug "${slug}" already exists for "${existing.data()!.name}". Your subject "${data.subject.trim()}" may have merged.`;
  }

  await db.collection('subjects').doc(slug).set({
    name: data.subject.trim(), slug, description: '', createdAt: new Date()
  }, { merge: true });

  const examRef = await db.collection('exams').add({
    subjectId: slug, title: data.examTitle.trim(),
    durationMinutes: data.durationMinutes || 0, totalQuestions: data.questions.length,
    createdAt: new Date(), published: true
  });

  const batch = db.batch();
  data.questions.forEach((q: any, i: number) => {
    const qRef = db.collection('exams').doc(examRef.id).collection('questions').doc();
    batch.set(qRef, {
      order: i + 1, questionText: q.questionText, options: q.options,
      correctOptionIndex: q.correctOptionIndex, explanation: q.explanation || null, marks: q.marks || 1
    });
  });
  await batch.commit();

  return { id: examRef.id, warning: slugWarning || undefined };
}

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const data = await ctx.request.json();
    const db = getAdminDb();

    // Multi-file: array of exam objects
    if (Array.isArray(data)) {
      const results: any[] = [];
      const errors: any[] = [];
      for (let i = 0; i < data.length; i++) {
        try {
          const r = await uploadSingleExam(data[i], db);
          results.push({ index: i, title: data[i].examTitle || 'Unknown', ...r });
        } catch (e: any) {
          errors.push({ index: i, title: data[i].examTitle || 'Unknown', error: e.message });
        }
      }
      return new Response(JSON.stringify({ batch: true, uploaded: results.length, failed: errors.length, results, errors }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Single exam
    const result = await uploadSingleExam(data, db);
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[Upload Error]', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
