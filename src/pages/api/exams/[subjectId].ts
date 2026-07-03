import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const GET: APIRoute = async ({ params }) => {
  try {
    const snap = await getDocs(query(collection(db, 'exams'), where('subjectId', '==', params.subjectId), where('published', '==', true)));
    const exams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return new Response(JSON.stringify(exams), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
