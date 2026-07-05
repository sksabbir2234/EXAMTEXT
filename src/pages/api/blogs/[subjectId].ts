import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs')
      .where('published', '==', true)
      .get();
    const blogs = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          subjectId: data.subjectId,
          examId: data.examId || null,
          slideUrl: data.slideUrl || null,
          createdAt: data.createdAt,
        };
      })
      .filter(b => b.subjectId === params.subjectId)
      .sort((a, b) => {
        const ta = a.createdAt?._seconds || a.createdAt?.seconds || 0;
        const tb = b.createdAt?._seconds || b.createdAt?.seconds || 0;
        return tb - ta;
      });
    return new Response(JSON.stringify(blogs), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
