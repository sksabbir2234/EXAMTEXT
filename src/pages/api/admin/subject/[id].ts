import type { APIRoute } from 'astro';
import { db } from '../../../../lib/firebase';
import { doc, deleteDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { checkAuth } from '../../../../lib/auth';

export const DELETE: APIRoute = async (ctx) => {
  const auth = checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const examSnap = await getDocs(query(collection(db, 'exams'), where('subjectId', '==', ctx.params!.id!)));
    for (const examDoc of examSnap.docs) {
      const qSnap = await getDocs(collection(db, 'exams', examDoc.id, 'questions'));
      const batch = writeBatch(db);
      qSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await deleteDoc(doc(db, 'exams', examDoc.id));
    }
    await deleteDoc(doc(db, 'subjects', ctx.params!.id!));
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
