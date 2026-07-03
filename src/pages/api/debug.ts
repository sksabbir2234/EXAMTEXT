import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  const original = raw;
  
  raw = raw.trim();
  if (raw.startsWith('"') && raw.endsWith('"')) {
    raw = raw.slice(1, -1);
  }
  raw = raw.replace(/\\"/g, '"');

  const info = {
    hasEnvVar: !!original,
    originalLength: original.length,
    first10: original.substring(0, 10),
    trimmed: false,
    parsed: false,
    error: null as string | null
  };
  
  try {
    JSON.parse(raw);
    info.parsed = true;
  } catch (e: any) {
    info.error = e.message;
  }
  
  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
};
