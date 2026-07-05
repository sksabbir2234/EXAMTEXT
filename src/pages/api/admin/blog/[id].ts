import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { checkAuth } from '../../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs').doc(ctx.params!.id!).get();
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
      published: data.published,
      createdAt: data.createdAt,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const data = await ctx.request.json();
    const db = getAdminDb();
    const updateData: any = { updatedAt: new Date() };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.slideUrl !== undefined) updateData.slideUrl = data.slideUrl || null;
    if (data.examId !== undefined) updateData.examId = data.examId || null;
    if (data.content !== undefined) {
      if (!Array.isArray(data.content) || data.content.length === 0) {
        return new Response(JSON.stringify({ error: 'content must be a non-empty array' }), { status: 400 });
      }
      updateData.content = data.content;
    }

    await db.collection('blogs').doc(ctx.params!.id!).update(updateData);
    return new Response(JSON.stringify({ message: 'Blog updated' }), { headers: { 'Content-Type': 'application/json' } });
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
    await db.collection('blogs').doc(ctx.params!.id!).delete();
    return new Response(JSON.stringify({ message: 'Blog deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
