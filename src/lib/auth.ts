import type { APIContext } from 'astro';

const COOKIE_NAME = 'adminSession';
const TOKEN_TTL = 60 * 60 * 8; // 8 hours

function getKey(): CryptoKey {
  const secret = import.meta.env.ADMIN_PASSWORD || '';
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return btoa(payload + '.' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));
}

async function verify(token: string): Promise<boolean> {
  try {
    const key = await getKey();
    const decoded = atob(token);
    const dotIdx = decoded.lastIndexOf('.');
    if (dotIdx === -1) return false;
    const payload = decoded.substring(0, dotIdx);
    const hexSig = decoded.substring(dotIdx + 1);
    const sigBytes = new Uint8Array(hexSig.match(/.{2}/g)!.map(h => parseInt(h, 16)));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
    if (!valid) return false;
    const data = JSON.parse(payload);
    return typeof data.exp === 'number' && Date.now() < data.exp;
  } catch { return false; }
}

export async function createSession(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + TOKEN_TTL * 1000 });
  return sign(payload);
}

export async function checkAuth(ctx: APIContext): Promise<{ ok: true } | { ok: false; response: Response }> {
  const token = ctx.cookies.get(COOKIE_NAME)?.value ?? null;
  if (token && await verify(token)) return { ok: true };
  return { ok: false, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
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

export function clearSessionCookie(ctx: APIContext) {
  ctx.cookies.delete(COOKIE_NAME, { path: '/' });
}
