import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { checkAuth } from '../../../../lib/auth';

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const { subjectId, orderedIds } = await ctx.request.json() as { subjectId: string; orderedIds: string[] };
    if (!subjectId || !Array.isArray(orderedIds) || orderedIds.length === 0) {
      return new Response(JSON.stringify({ error: 'subjectId and orderedIds required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const db = getAdminDb();
    const batch = db.batch();
    orderedIds.forEach((id, i) => {
      const ref = db.collection('exams').doc(id);
      batch.update(ref, { order: i + 1 });
    });
    await batch.commit();

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
