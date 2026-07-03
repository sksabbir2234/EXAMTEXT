import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const GET: APIRoute = async () => {
  try {
    const subSnap = await getDocs(collection(db, 'subjects'));
    const subjects = [];
    for (const subDoc of subSnap.docs) {
      const examSnap = await getDocs(query(collection(db, 'exams'), where('subjectId', '==', subDoc.id)));
      subjects.push({ id: subDoc.id, ...subDoc.data(), exams: examSnap.docs.map(e => ({ id: e.id, ...e.data() })) });
    }
    return new Response(JSON.stringify(subjects), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[Admin All] Error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
