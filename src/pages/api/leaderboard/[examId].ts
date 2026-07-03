import type { APIRoute } from 'astro';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const snap = await getDocs(query(collection(db, 'attempts'), where('examId', '==', params.examId), orderBy('score', 'desc'), limit(50)));
    const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return new Response(JSON.stringify(attempts), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
