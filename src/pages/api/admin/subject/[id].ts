import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { checkAuth } from '../../../../lib/auth';

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const PUT: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;
  try {
    const body = await ctx.request.json() as any;
    const name = (body.name || '').trim();
    if (!name) return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
    const newSlug = slugify(name);
    const db = getAdminDb();
    const oldId = ctx.params!.id!;

    if (newSlug !== oldId) {
      const exists = await db.collection('subjects').doc(newSlug).get();
      if (exists.exists) return new Response(JSON.stringify({ error: 'Name already used by another subject' }), { status: 409 });
      const oldDoc = await db.collection('subjects').doc(oldId).get();
      if (!oldDoc.exists) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      const data = oldDoc.data()!;
      await db.collection('subjects').doc(newSlug).set({ ...data, name, slug: newSlug });
      await db.collection('subjects').doc(oldId).delete();
      const exSnap = await db.collection('exams').where('subjectId', '==', oldId).get();
      const b1 = db.batch();
      exSnap.docs.forEach((d) => b1.update(d.ref, { subjectId: newSlug }));
      await b1.commit();
      const blSnap = await db.collection('blogs').where('subjectId', '==', oldId).get();
      const b2 = db.batch();
      blSnap.docs.forEach((d) => b2.update(d.ref, { subjectId: newSlug }));
      await b2.commit();
      return new Response(JSON.stringify({ id: newSlug, name, slug: newSlug }), { headers: { 'Content-Type': 'application/json' } });
    }

    await db.collection('subjects').doc(oldId).update({ name });
    return new Response(JSON.stringify({ id: oldId, name, slug: oldId }), { headers: { 'Content-Type': 'application/json' } });
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
    const examSnap = await db.collection('exams').where('subjectId', '==', ctx.params!.id!).get();
    for (const examDoc of examSnap.docs) {
      const qSnap = await db.collection('exams').doc(examDoc.id).collection('questions').get();
      const batch = db.batch();
      qSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await db.collection('exams').doc(examDoc.id).delete();
    }
    await db.collection('subjects').doc(ctx.params!.id!).delete();
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
