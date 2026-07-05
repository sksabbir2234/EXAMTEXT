import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs')
      .where('subjectId', '==', params.subjectId)
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    const blogs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        examId: data.examId || null,
        slideUrl: data.slideUrl || null,
        createdAt: data.createdAt,
      };
    });
    return new Response(JSON.stringify(blogs), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
