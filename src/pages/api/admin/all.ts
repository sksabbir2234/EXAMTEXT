import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const db = getAdminDb();
    const subSnap = await db.collection('subjects').get();

    // Get attempt counts per exam
    const attemptsSnap = await db.collection('attempts').get();
    const attemptCounts: Record<string, number> = {};
    const avgScores: Record<string, number> = {};
    const scoreSums: Record<string, number> = {};
    attemptsSnap.docs.forEach(d => {
      const data = d.data();
      const eid = data.examId;
      attemptCounts[eid] = (attemptCounts[eid] || 0) + 1;
      scoreSums[eid] = (scoreSums[eid] || 0) + (data.score || 0);
    });

    const subjects = [];
    for (const subDoc of subSnap.docs) {
      const examSnap = await db.collection('exams').where('subjectId', '==', subDoc.id).get();
      subjects.push({
        id: subDoc.id, ...subDoc.data(),
        exams: examSnap.docs.map(e => {
          const eid = e.id;
          const count = attemptCounts[eid] || 0;
          const avg = count > 0 ? Math.round((scoreSums[eid] || 0) / count) : 0;
          return { id: eid, ...e.data(), attemptCount: count, avgScore: avg };
        })
      });
    }
    // Sort subjects by order field (missing order goes last)
    subjects.sort((a: any, b: any) => {
      const aOrder = typeof a.order === 'number' ? a.order : 9999;
      const bOrder = typeof b.order === 'number' ? b.order : 9999;
      return aOrder - bOrder;
    });
    return new Response(JSON.stringify(subjects), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[Admin All] Error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
