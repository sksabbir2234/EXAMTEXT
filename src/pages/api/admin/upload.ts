import type { APIRoute } from 'astro';
import { db } from '../../../lib/admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const slug = (data.subject || 'general').toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    await db.collection('subjects').doc(slug).set({
      name: data.subject || 'General', slug, description: '', createdAt: new Date()
    }, { merge: true });

    const examRef = await db.collection('exams').add({
      subjectId: slug, title: data.examTitle || 'Untitled',
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

    return new Response(JSON.stringify({ id: examRef.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[Upload Error]', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
