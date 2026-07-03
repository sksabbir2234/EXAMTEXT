import type { APIRoute } from 'astro';
import { db } from '../../../lib/admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const snap = await db.collection('attempts').where('examId', '==', params.examId).orderBy('score', 'desc').limit(50).get();
    const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return new Response(JSON.stringify(attempts), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
