import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs').orderBy('createdAt', 'desc').get();
    const blogs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        published: data.published,
        subjectId: data.subjectId,
        examId: data.examId || null,
        slideUrl: data.slideUrl || null,
        contentCount: Array.isArray(data.content) ? data.content.length : 0,
        createdAt: data.createdAt,
      };
    });
    return new Response(JSON.stringify(blogs), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
