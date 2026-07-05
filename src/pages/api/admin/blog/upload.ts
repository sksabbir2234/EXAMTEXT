import type { APIRoute } from 'astro';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { checkAuth } from '../../../../lib/auth';

function toBlogSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').substring(0, 80);
}

function validateBlogContent(content: any[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(content) || content.length === 0) {
    errors.push('content must be a non-empty array');
    return errors;
  }
  content.forEach((item: any, i: number) => {
    const n = i + 1;
    if (!item.question || typeof item.question !== 'string') errors.push(`Item ${n}: missing question`);
    if (!item.answer || typeof item.answer !== 'string') errors.push(`Item ${n}: missing answer`);
    if (item.tags && !Array.isArray(item.tags)) errors.push(`Item ${n}: tags must be an array`);
  });
  return errors;
}

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const data = await ctx.request.json();

    if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
      return new Response(JSON.stringify({ error: 'subject is required' }), { status: 400 });
    }
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      return new Response(JSON.stringify({ error: 'title is required' }), { status: 400 });
    }
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      return new Response(JSON.stringify({ error: 'content must be a non-empty array' }), { status: 400 });
    }

    const contentErrors = validateBlogContent(data.content);
    if (contentErrors.length > 0) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: contentErrors }), { status: 400 });
    }

    const slug = toBlogSlug(data.title);
    const subjectSlug = data.subject.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const db = getAdminDb();

    if (data.examId) {
      const examSnap = await db.collection('exams').doc(data.examId).get();
      if (!examSnap.exists) {
        return new Response(JSON.stringify({ error: `examId "${data.examId}" not found` }), { status: 400 });
      }
    }

    const slideUrl = data.slideUrl || null;
    if (slideUrl && typeof slideUrl === 'string' && slideUrl.trim()) {
      try { new URL(slideUrl); } catch {
        return new Response(JSON.stringify({ error: 'slideUrl is not a valid URL' }), { status: 400 });
      }
    }

    const blogRef = await db.collection('blogs').add({
      subjectId: subjectSlug,
      examId: data.examId || null,
      title: data.title.trim(),
      slug,
      description: data.description || '',
      slideUrl: slideUrl && slideUrl.trim() ? slideUrl.trim() : null,
      published: false,
      content: data.content,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ id: blogRef.id, message: 'Blog created as draft' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[Blog Upload Error]', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
