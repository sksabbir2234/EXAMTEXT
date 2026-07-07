import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../lib/firebase-admin';
import { checkAuth } from '../../../lib/auth';

export const GET: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const db = getAdminDb();
    const url = new URL(ctx.request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 200);

    // Single-field orderBy('createdAt', 'desc') — no composite index needed
    const snap = await db.collection('attempts')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    // Batch-fetch exam titles (deduplicate examIds)
    const examIds = [...new Set(snap.docs.map(d => d.data().examId).filter(Boolean))];
    const examMap: Record<string, { title: string; subjectId: string }> = {};

    await Promise.all(examIds.map(async (eid) => {
      try {
        const examDoc = await db.collection('exams').doc(eid).get();
        if (examDoc.exists) {
          const ed = examDoc.data()!;
          examMap[eid] = { title: ed.title || 'Untitled', subjectId: ed.subjectId || '' };
        }
      } catch {}
    }));

    const attempts = snap.docs.map(d => {
      const data = d.data();
      const exam = examMap[data.examId] || { title: 'Unknown', subjectId: '' };
      return {
        id: d.id,
        studentName: data.studentName || 'Anonymous',
        examId: data.examId || '',
        examTitle: exam.title,
        subjectId: exam.subjectId,
        score: data.score || 0,
        total: data.total || 0,
        timeTaken: data.timeTaken || 0,
        createdAt: data.createdAt || { _seconds: 0 },
      };
    });

    return new Response(JSON.stringify(attempts), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[Monitor Error]', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
