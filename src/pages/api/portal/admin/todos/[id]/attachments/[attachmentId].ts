/**
 * GET    /api/portal/admin/todos/:id/attachments/:attachmentId
 *           → { signedUrl }     (60s TTL, for download / inline view)
 * DELETE /api/portal/admin/todos/:id/attachments/:attachmentId
 *
 * Admin-only. Scopes by owner_id even though service-role bypasses RLS.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../../lib/session';

const BUCKET = 'owner-todo-attachments';
const SIGNED_URL_TTL_SECONDS = 60;

export const GET: APIRoute = async ({ params, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const { id: todoId, attachmentId } = params;
  if (!todoId || !attachmentId) return json({ error: 'Missing id' }, 400);

  const admin = createServiceSupabase();
  const { data: row } = await admin
    .from('owner_todo_attachments')
    .select('storage_path, file_name')
    .eq('id', attachmentId)
    .eq('todo_id', todoId)
    .eq('owner_id', session.userId)
    .maybeSingle();

  if (!row) return json({ error: 'Not found' }, 404);

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS, {
      download: row.file_name,
    });
  if (error || !data) return json({ error: error?.message ?? 'Could not sign URL' }, 500);

  return json({ signedUrl: data.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const { id: todoId, attachmentId } = params;
  if (!todoId || !attachmentId) return json({ error: 'Missing id' }, 400);

  const admin = createServiceSupabase();
  const { data: row } = await admin
    .from('owner_todo_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .eq('todo_id', todoId)
    .eq('owner_id', session.userId)
    .maybeSingle();

  if (!row) return json({ error: 'Not found' }, 404);

  // Storage first; if the DB delete fails after, the API caller will retry
  // and the second-pass storage remove() is a harmless no-op.
  await admin.storage.from(BUCKET).remove([row.storage_path]);

  const { error } = await admin
    .from('owner_todo_attachments')
    .delete()
    .eq('id', attachmentId)
    .eq('todo_id', todoId)
    .eq('owner_id', session.userId);
  if (error) return json({ error: error.message }, 500);

  await admin
    .from('owner_todos')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', todoId)
    .eq('owner_id', session.userId);

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
