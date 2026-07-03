import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const admin = await import('firebase-admin');
    const defaultApp = admin.default;
    
    if (!defaultApp.apps.length) {
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
      if (!raw) return new Response(JSON.stringify({ step: 'no env var' }), { headers: { 'Content-Type': 'application/json' } });

      raw = raw.trim();
      if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
      raw = raw.replace(/\\"/g, '"');
      if (!raw.startsWith('{')) raw = '{' + raw;
      if (!raw.endsWith('}')) raw = raw + '}';

      const sa = JSON.parse(raw);
      defaultApp.initializeApp({ credential: defaultApp.credential.cert(sa) });
    }

    const firestore = defaultApp.firestore();
    const snap = await firestore.collection('subjects').limit(1).get();
    return new Response(JSON.stringify({ ok: true, count: snap.size }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, code: e.code, stack: e.stack?.substring(0, 500) }), { headers: { 'Content-Type': 'application/json' } });
  }
};
