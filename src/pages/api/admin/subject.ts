import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;
  try {
    const body = await ctx.request.json() as any;
    const name = (body.name || '').trim();
    if (!name) return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
    const slug = slugify(name) || 'subject-' + Date.now();
    const db = getAdminDb();
    const existing = await db.collection('subjects').doc(slug).get();
    if (existing.exists) return new Response(JSON.stringify({ error: 'A subject with this name already exists' }), { status: 409 });
    await db.collection('subjects').doc(slug).set({
      name,
      slug,
      description: body.description || '',
      createdAt: new Date(),
    });
    return new Response(JSON.stringify({ id: slug, name, slug }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
