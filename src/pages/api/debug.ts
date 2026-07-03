import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  const info = {
    hasEnvVar: !!raw,
    envVarLength: raw.length,
    first20Chars: raw.substring(0, 20),
    last10Chars: raw.substring(raw.length - 10),
    parsed: false,
    error: null as string | null
  };
  
  if (raw) {
    try {
      JSON.parse(raw);
      info.parsed = true;
    } catch (e: any) {
      info.error = e.message;
    }
  }
  
  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
};
