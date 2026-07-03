import type { APIRoute } from 'astro';
import { createSession, setSessionCookie, getSessionToken, destroySession, clearSessionCookie } from '../../../lib/auth';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || '';

export const POST: APIRoute = async (ctx) => {
  if (!ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Admin password not configured' }), { status: 500 });
  }
  try {
    const { password } = await ctx.request.json();
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Wrong password' }), { status: 401 });
    }
    const token = createSession();
    setSessionCookie(ctx, token);
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async (ctx) => {
  const token = getSessionToken(ctx);
  if (token) destroySession(token);
  clearSessionCookie(ctx);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
