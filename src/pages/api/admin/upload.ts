import type { APIRoute } from 'astro';
import { collection, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
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

    const examRef = await addDoc(collection(db, 'exams'), {
      subjectId: subjectSlug, title: data.examTitle || 'Untitled', slug: slugify(data.examTitle || 'untitled'),
      durationMinutes: data.durationMinutes || 0, totalQuestions: data.questions.length, createdAt: new Date(), published: true
    });

    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      await addDoc(collection(db, 'exams', examRef.id, 'questions'), {
        order: i + 1, questionText: q.questionText, options: q.options,
        correctOptionIndex: q.correctOptionIndex, explanation: q.explanation || null, marks: q.marks || 1
      });
    }

    return new Response(JSON.stringify({ id: examRef.id, message: 'Uploaded' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
