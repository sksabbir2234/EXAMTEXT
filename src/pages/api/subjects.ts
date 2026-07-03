import type { APIRoute } from 'astro';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const GET: APIRoute = async () => {
  try {
    const snap = await getDocs(collection(db, 'subjects'));
    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return new Response(JSON.stringify(subjects), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
