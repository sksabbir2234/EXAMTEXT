import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { checkAuth } from '../../../../lib/auth';

export const DELETE: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const db = getAdminDb();
    const examSnap = await db.collection('exams').where('subjectId', '==', ctx.params!.id!).get();
    for (const examDoc of examSnap.docs) {
      const qSnap = await db.collection('exams').doc(examDoc.id).collection('questions').get();
      const batch = db.batch();
      qSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await db.collection('exams').doc(examDoc.id).delete();
    }
    await db.collection('subjects').doc(ctx.params!.id!).delete();
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
