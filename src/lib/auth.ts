import type { APIContext } from 'astro';

const COOKIE_NAME = 'adminSession';
const TOKEN_TTL = 60 * 60 * 8; // 8 hours

// In-memory token store (resets on cold start — fine for single-instance)
const sessions = new Map<string, number>();

export function createSession(): string {
  const token = crypto.randomUUID();
  sessions.set(token, Date.now() + TOKEN_TTL * 1000);
  return token;
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const expires = sessions.get(token);
  if (!expires) return false;
  if (Date.now() > expires) { sessions.delete(token); return false; }
  return true;
}

export function destroySession(token: string) {
  sessions.delete(token);
}

export function setSessionCookie(ctx: APIContext, token: string) {
  ctx.cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: TOKEN_TTL,
  });
}

export function getSessionToken(ctx: APIContext): string | null {
  return ctx.cookies.get(COOKIE_NAME)?.value ?? null;
}

export function clearSessionCookie(ctx: APIContext) {
  ctx.cookies.delete(COOKIE_NAME, { path: '/' });
}

export function checkAuth(ctx: APIContext): { ok: true } | { ok: false; response: Response } {
  const token = getSessionToken(ctx);
  if (isValidSession(token)) return { ok: true };
  return { ok: false, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
}
