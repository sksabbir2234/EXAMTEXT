import type { APIRoute } from 'astro';
import { db } from '../../../../lib/admin';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const examSnap = await db.collection('exams').where('subjectId', '==', params.id!).get();
    for (const examDoc of examSnap.docs) {
      const qSnap = await db.collection('exams').doc(examDoc.id).collection('questions').get();
      const batch = db.batch();
      qSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await db.collection('exams').doc(examDoc.id).delete();
    }
    await db.collection('subjects').doc(params.id!).delete();
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
