import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const db = getAdminDb();
    const snap = await db.collection('subjects').orderBy('name').get();
    const subjects = snap.docs.map(d => ({
      id: d.id,
      name: d.data().name || d.id,
      slug: d.data().slug || d.id,
      description: d.data().description || '',
    }));
    return new Response(JSON.stringify(subjects), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
