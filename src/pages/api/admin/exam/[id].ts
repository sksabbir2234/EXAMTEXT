import type { APIRoute } from 'astro';
import { db } from '../../../../lib/admin';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const qSnap = await db.collection('exams').doc(params.id!).collection('questions').get();
    const batch = db.batch();
    qSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await db.collection('exams').doc(params.id!).delete();
    return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
