import type { APIRoute } from 'astro';
import { db } from '../../../../lib/firebase';
import { doc, deleteDoc, collection, getDocs, query, writeBatch } from 'firebase/firestore';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const qSnap = await getDocs(collection(db, 'exams', params.id!, 'questions'));
    const batch = writeBatch(db);
    qSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await deleteDoc(doc(db, 'exams', params.id!));
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
