import type { APIRoute } from 'astro';
import { db } from '../../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { checkAuth } from '../../../../../lib/auth';

export const PUT: APIRoute = async (ctx) => {
  const auth = checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const { published } = await ctx.request.json();
    await updateDoc(doc(db, 'exams', ctx.params!.id!), { published });
    return new Response(JSON.stringify({ message: 'Updated' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
