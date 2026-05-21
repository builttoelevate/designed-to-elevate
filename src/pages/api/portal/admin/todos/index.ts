/**
 * POST /api/portal/admin/todos   { title, body?, due_at?, priority? }
 *
 * Admin-only. Creates a personal todo owned by the calling admin
 * (owner_id is set from the session — clients can't spoof it).
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const MAX_TITLE = 200;
const MAX_BODY = 50_000;

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  let body: {
    title?: string;
    body?: string | null;
    due_at?: string | null;
    priority?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const title = (body.title ?? '').trim();
  if (!title) return json({ error: 'Title required' }, 400);
  if (title.length > MAX_TITLE) return json({ error: `Title too long (${MAX_TITLE} max)` }, 400);

  const todoBody =
    typeof body.body === 'string' && body.body.trim().length > 0 ? body.body : null;
  if (todoBody && todoBody.length > MAX_BODY) {
    return json({ error: `Body too long (${MAX_BODY} max)` }, 400);
  }

  // due_at is a date (YYYY-MM-DD), not a timestamp.
  let dueAt: string | null = null;
  if (body.due_at) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.due_at)) {
      return json({ error: 'due_at must be YYYY-MM-DD' }, 400);
    }
    const probe = new Date(`${body.due_at}T00:00:00Z`);
    if (Number.isNaN(probe.getTime())) return json({ error: 'Invalid due_at' }, 400);
    dueAt = body.due_at;
  }

  // priority: 0=low, 1=normal (default), 2=high
  let priority = 1;
  if (body.priority !== undefined && body.priority !== null) {
    if (!Number.isInteger(body.priority) || ![0, 1, 2].includes(body.priority)) {
      return json({ error: 'priority must be 0, 1, or 2' }, 400);
    }
    priority = body.priority;
  }

  const admin = createServiceSupabase();
  const { data, error } = await admin
    .from('owner_todos')
    .insert({ owner_id: session.userId, title, body: todoBody, due_at: dueAt, priority })
    .select('id, title, body, due_at, priority, completed, created_at, completed_at, updated_at')
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ todo: data });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
