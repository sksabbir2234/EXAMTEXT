import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { checkAuth } from '../../../../lib/auth';

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  let body: any;
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { subjectId, orderedIds } = body;

  console.log('[reorder] subjectId:', subjectId, 'orderedIds:', orderedIds);

  if (!subjectId || !Array.isArray(orderedIds) || orderedIds.length === 0) {
    return new Response(
      JSON.stringify({ error: 'orderedIds is empty — no data found on drag rows' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const db = getAdminDb();
    const batch = db.batch();

    orderedIds.forEach((examId: string, index: number) => {
      const ref = db.collection('exams').doc(examId);
      batch.update(ref, { sortOrder: index + 1 });
    });

    await batch.commit();
    console.log('[reorder] committed', orderedIds.length, 'updates');

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[reorder] error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
