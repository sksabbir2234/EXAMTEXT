import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const GET: APIRoute = async ({ params }) => {
  try {
    const snap = await getDoc(doc(db, 'exams', params.id!));
    if (!snap.exists()) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const exam: any = { id: snap.id, ...snap.data() };
    try {
      const subSnap = await getDoc(doc(db, 'subjects', exam.subjectId));
      if (subSnap.exists()) exam.subjectName = subSnap.data().name;
    } catch {}
    return new Response(JSON.stringify(exam), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
