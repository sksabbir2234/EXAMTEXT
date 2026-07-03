import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../../lib/firebase-admin';
import { checkAuth } from '../../../../../lib/auth';

export const PUT: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const { published } = await ctx.request.json();
    const db = getAdminDb();
    await db.collection('exams').doc(ctx.params!.id!).update({ published });
    return new Response(JSON.stringify({ message: 'Updated' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
