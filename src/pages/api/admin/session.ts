import type { APIRoute } from 'astro';
import { checkAuth } from '../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) {
    return new Response(JSON.stringify({ authed: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ authed: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
