/**
 * PATCH  /api/portal/admin/todos/:id   { completed?, title?, body?, due_at? }
 * DELETE /api/portal/admin/todos/:id
 *
 * Admin-only. Operates only on rows owned by the calling admin —
 * filters by owner_id even though the service-role client bypasses RLS,
 * so a malicious admin couldn't tamper with a future second admin's rows.
 *
 * DELETE also removes any attached storage objects so we don't leave orphans.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const MAX_TITLE = 200;
const MAX_BODY = 50_000;
const BUCKET = 'owner-todo-attachments';

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  let body: {
    completed?: boolean;
    title?: string;
    body?: string | null;
    due_at?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const patch: Record<string, unknown> = {};

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      return json({ error: 'completed must be boolean' }, 400);
    }
    patch.completed = body.completed;
  }

  if (body.title !== undefined) {
    const t = (body.title ?? '').trim();
    if (!t) return json({ error: 'Title required' }, 400);
    if (t.length > MAX_TITLE) return json({ error: `Title too long (${MAX_TITLE} max)` }, 400);
    patch.title = t;
  }

  if (body.body !== undefined) {
    if (body.body === null || body.body === '') {
      patch.body = null;
    } else if (typeof body.body !== 'string') {
      return json({ error: 'body must be string or null' }, 400);
    } else {
      if (body.body.length > MAX_BODY) {
        return json({ error: `Body too long (${MAX_BODY} max)` }, 400);
      }
      patch.body = body.body;
    }
  }

  // due_at is a date (YYYY-MM-DD), not a timestamp.
  if (body.due_at !== undefined) {
    if (body.due_at === null || body.due_at === '') {
      patch.due_at = null;
    } else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.due_at)) {
        return json({ error: 'due_at must be YYYY-MM-DD' }, 400);
      }
      const probe = new Date(`${body.due_at}T00:00:00Z`);
      if (Number.isNaN(probe.getTime())) return json({ error: 'Invalid due_at' }, 400);
      patch.due_at = body.due_at;
    }
  }

  if (Object.keys(patch).length === 0) {
    return json({ error: 'No fields to update' }, 400);
  }

  const admin = createServiceSupabase();
  const { data, error } = await admin
    .from('owner_todos')
    .update(patch)
    .eq('id', id)
    .eq('owner_id', session.userId)
    .select('id, title, body, due_at, completed, created_at, completed_at, updated_at')
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'Not found' }, 404);
  return json({ todo: data });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  const admin = createServiceSupabase();

  // Look up storage paths first so we can clean up the bucket; the DB cascade
  // will then drop the attachment rows automatically with the parent todo.
  const { data: attachments } = await admin
    .from('owner_todo_attachments')
    .select('storage_path')
    .eq('todo_id', id)
    .eq('owner_id', session.userId);

  const paths = (attachments ?? [])
    .map((a: { storage_path: string }) => a.storage_path)
    .filter(Boolean);
  if (paths.length > 0) {
    // Best-effort: ignore storage errors so an orphaned object can't block a
    // todo delete. Worst case we leave a file behind, which is recoverable.
    await admin.storage.from(BUCKET).remove(paths);
  }

  const { error, count } = await admin
    .from('owner_todos')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('owner_id', session.userId);

  if (error) return json({ error: error.message }, 500);
  if (!count) return json({ error: 'Not found' }, 404);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
