import type { APIRoute } from 'astro';
import { db } from '../../../../lib/firebase';
import { doc, deleteDoc, getDoc, collection, getDocs, query, orderBy, writeBatch } from 'firebase/firestore';
import { checkAuth } from '../../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const examId = ctx.params?.id;
    if (!examId) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    const examSnap = await getDoc(doc(db, 'exams', examId));
    if (!examSnap.exists()) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const examData = { id: examSnap.id, ...examSnap.data() };

    const qSnap = await getDocs(query(collection(db, 'exams', examId, 'questions'), orderBy('order')));
    const questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return new Response(JSON.stringify({ ...examData, questions }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async (ctx) => {
  const auth = checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const examId = ctx.params?.id;
    if (!examId) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
    const data = await ctx.request.json();

    // Validate
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      return new Response(JSON.stringify({ error: 'questions must be a non-empty array' }), { status: 400 });
    }

    // Update exam metadata
    const updateData: any = {};
    if (data.examTitle) updateData.title = data.examTitle;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.totalQuestions !== undefined) updateData.totalQuestions = data.totalQuestions;
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length > 1) {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'exams', examId), updateData);
    }

    // Replace questions subcollection
    const oldQSnap = await getDocs(collection(db, 'exams', examId, 'questions'));
    const batch = writeBatch(db);
    oldQSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();

    const newBatch = writeBatch(db);
    data.questions.forEach((q: any, i: number) => {
      const qRef = doc(collection(db, 'exams', examId, 'questions'));
      newBatch.set(qRef, {
        order: i + 1, questionText: q.questionText, options: q.options,
        correctOptionIndex: q.correctOptionIndex, explanation: q.explanation || null, marks: q.marks || 1
      });
    });
    await newBatch.commit();

    return new Response(JSON.stringify({ message: 'Updated', id: examId }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async (ctx) => {
  const auth = checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const qSnap = await getDocs(collection(db, 'exams', ctx.params!.id!, 'questions'));
    const batch = writeBatch(db);
    qSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await deleteDoc(doc(db, 'exams', ctx.params!.id!));
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
