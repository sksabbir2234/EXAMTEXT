import type { APIRoute } from 'astro';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const qSnap = await getDocs(collection(db, 'exams', params.id!, 'questions'));
    for (const d of qSnap.docs) await deleteDoc(d.ref);
    await deleteDoc(doc(db, 'exams', params.id!));
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
