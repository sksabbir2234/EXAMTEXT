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

async function uploadSingleBlog(data: any, db: any): Promise<{ id: string }> {
  if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
    throw new Error('subject is required');
  }
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    throw new Error('title is required');
  }
  if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
    throw new Error('content must be a non-empty array');
  }

  const contentErrors = validateBlogContent(data.content);
  if (contentErrors.length > 0) {
    throw new Error('Validation failed: ' + contentErrors.join('; '));
  }

  const slug = toBlogSlug(data.title);
  const subjectSlug = data.subject.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

  if (data.examId) {
    const examSnap = await db.collection('exams').doc(data.examId).get();
    if (!examSnap.exists) {
      throw new Error(`examId "${data.examId}" not found`);
    }
  }

  const slideUrl = data.slideUrl || null;
  if (slideUrl && typeof slideUrl === 'string' && slideUrl.trim()) {
    try { new URL(slideUrl); } catch {
      throw new Error('slideUrl is not a valid URL');
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

  return { id: blogRef.id };
}

export const POST: APIRoute = async (ctx) => {
  const auth = await checkAuth(ctx);
  if (!auth.ok) return auth.response;

  try {
    const data = await ctx.request.json();
    const db = getAdminDb();

    // Multi-file: array of blog objects
    if (Array.isArray(data)) {
      const results: any[] = [];
      const errors: any[] = [];
      for (let i = 0; i < data.length; i++) {
        try {
          const r = await uploadSingleBlog(data[i], db);
          results.push({ index: i, title: data[i].title || 'Unknown', ...r });
        } catch (e: any) {
          errors.push({ index: i, title: data[i].title || 'Unknown', error: e.message });
        }
      }
      return new Response(JSON.stringify({ batch: true, uploaded: results.length, failed: errors.length, results, errors }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Single blog
    const result = await uploadSingleBlog(data, db);
    return new Response(JSON.stringify({ id: result.id, message: 'Blog created as draft' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[Blog Upload Error]', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
