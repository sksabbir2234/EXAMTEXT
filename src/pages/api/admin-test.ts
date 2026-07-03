import type { APIRoute } from 'astro';
import { db } from '../../lib/admin';

export const GET: APIRoute = async () => {
  try {
    const snap = await db.collection('subjects').limit(1).get();
    return new Response(JSON.stringify({ ok: true, count: snap.size }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { headers: { 'Content-Type': 'application/json' } });
  }
};
