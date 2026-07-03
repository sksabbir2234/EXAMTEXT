import type { APIRoute } from 'astro';
import { db } from '../../lib/admin';

export const GET: APIRoute = async () => {
  try {
    const snap = await db.collection('subjects').get();
    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return new Response(JSON.stringify(subjects), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
