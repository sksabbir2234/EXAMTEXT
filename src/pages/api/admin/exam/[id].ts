import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { checkAuth } from '../../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const examId = ctx.params?.id;
    if (!examId) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    const db = getAdminDb();
    const examSnap = await db.collection('exams').doc(examId).get();
    if (!examSnap.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const examData = { id: examSnap.id, ...examSnap.data() };
    const qSnap = await db.collection('exams').doc(examId).collection('questions').orderBy('order').get();
    const questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return new Response(JSON.stringify({ ...examData, questions }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const examId = ctx.params?.id;
    if (!examId) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
    const data = await ctx.request.json();

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      return new Response(JSON.stringify({ error: 'questions must be a non-empty array' }), { status: 400 });
    }

    const db = getAdminDb();
    const updateData: any = { updatedAt: new Date() };
    if (data.examTitle) updateData.title = data.examTitle;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.totalQuestions !== undefined) updateData.totalQuestions = data.totalQuestions;

    if (Object.keys(updateData).length > 1) {
      await db.collection('exams').doc(examId).update(updateData);
    }

    const oldQSnap = await db.collection('exams').doc(examId).collection('questions').get();
    const delBatch = db.batch();
    oldQSnap.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();

    const newBatch = db.batch();
    data.questions.forEach((q: any, i: number) => {
      const qRef = db.collection('exams').doc(examId).collection('questions').doc();
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

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const body = await ctx.request.json();
    if (body.action !== 'delete') {
      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }

    const db = getAdminDb();
    const qSnap = await db.collection('exams').doc(ctx.params!.id!).collection('questions').get();
    const batch = db.batch();
    qSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await db.collection('exams').doc(ctx.params!.id!).delete();
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
