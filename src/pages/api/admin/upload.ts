import type { APIRoute } from 'astro';
import { collection, doc, setDoc, writeBatch, getFirestore } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

function slugify(text: string) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const subjectSlug = slugify(data.subject || 'general');

    await setDoc(doc(db, 'subjects', subjectSlug), {
      name: data.subject || 'General', slug: subjectSlug, description: '', createdAt: new Date()
    }, { merge: true });

    const examRef = doc(collection(db, 'exams'));
    await setDoc(examRef, {
      subjectId: subjectSlug, title: data.examTitle || 'Untitled', slug: slugify(data.examTitle || 'untitled'),
      durationMinutes: data.durationMinutes || 0, totalQuestions: data.questions.length, createdAt: new Date(), published: true
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

    return new Response(JSON.stringify({ id: examRef.id, message: 'Uploaded' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
