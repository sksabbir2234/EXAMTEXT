import type { APIRoute } from 'astro';
import { db } from '../../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { published } = await request.json();
    await updateDoc(doc(db, 'exams', params.id!), { published });
    return new Response(JSON.stringify({ message: 'Updated' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
