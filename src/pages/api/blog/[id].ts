import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs').doc(params.id!).get();
    if (!snap.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const data = snap.data()!;
    return new Response(JSON.stringify({
      id: snap.id,
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      subjectId: data.subjectId,
      examId: data.examId || null,
      slideUrl: data.slideUrl || null,
      content: data.content || [],
      createdAt: data.createdAt,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
