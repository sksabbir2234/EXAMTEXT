import type { APIRoute } from 'astro';
import { getAdminDb } from '../../lib/firebase-admin';

export const GET: APIRoute = async () => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('subjects').get();
    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by order field (nulls last)
    subjects.sort((a: any, b: any) => {
      const oa = a.order ?? Infinity;
      const ob = b.order ?? Infinity;
      return oa - ob;
    });
    return new Response(JSON.stringify(subjects), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
