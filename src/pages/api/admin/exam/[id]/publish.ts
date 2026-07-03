import type { APIRoute } from 'astro';
import { db } from '../../../../../lib/admin';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { published } = await request.json();
    await db.collection('exams').doc(params.id!).update({ published });
    return new Response(JSON.stringify({ message: 'Updated' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
