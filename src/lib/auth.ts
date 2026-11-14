import type { APIContext } from 'astro';
import nodeCrypto from 'node:crypto';

const COOKIE_NAME = 'adminSession';
const TOKEN_TTL = 60 * 60 * 8; // 8 hours, in seconds

function getSecret(): string {
  const secret = import.meta.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD env var is not set');
  return secret;
}

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return nodeCrypto.timingSafeEqual(bufA, bufB);
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Buffer.from(sigBuf).toString('base64url');
}

export async function createSession(): Promise<string> {
  const expires = Date.now() + TOKEN_TTL * 1000;
  const payload = String(expires);
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function isValidSession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const expected = await sign(payload);
  return timingSafeCompare(sig, expected);
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

export async function checkAuth(ctx: APIContext): Promise<{ ok: true } | { ok: false; response: Response }> {
  const token = getSessionToken(ctx);
  if (await isValidSession(token)) return { ok: true };
  return {
    ok: false,
    response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),
  };
}
