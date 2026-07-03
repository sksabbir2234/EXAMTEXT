import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, setDoc, writeBatch } from 'firebase/firestore';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const slug = (data.subject || 'general').toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    await setDoc(doc(db, 'subjects', slug), {
      name: data.subject || 'General', slug, description: '', createdAt: new Date()
    }, { merge: true });

    const examRef = await addDoc(collection(db, 'exams'), {
      subjectId: slug, title: data.examTitle || 'Untitled',
      durationMinutes: data.durationMinutes || 0, totalQuestions: data.questions.length,
      createdAt: new Date(), published: true
    });

    const batch = writeBatch(db);
    data.questions.forEach((q: any, i: number) => {
      const qRef = doc(collection(db, 'exams', examRef.id, 'questions'));
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
