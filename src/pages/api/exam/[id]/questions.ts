import type { APIRoute } from 'astro';
import { collection, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const snap = await getDocs(collection(db, 'exams', params.id!, 'questions'));
    const questions = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => a.order - b.order);
    return new Response(JSON.stringify(questions), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
