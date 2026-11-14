import type { APIRoute } from 'astro';
import { createSession, setSessionCookie, clearSessionCookie, timingSafeCompare } from '../../../lib/auth';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || '';

export const POST: APIRoute = async (ctx) => {
  if (!ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Admin password not configured' }), { status: 500 });
  }
  try {
    const body = await ctx.request.json();

    // Logout
    if (body.action === 'logout') {
      clearSessionCookie(ctx);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Login
    if (typeof body.password !== 'string' || !timingSafeCompare(body.password, ADMIN_PASSWORD)) {
      return new Response(JSON.stringify({ error: 'Wrong password' }), { status: 401 });
    }
    const token = await createSession();
    setSessionCookie(ctx, token);
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
