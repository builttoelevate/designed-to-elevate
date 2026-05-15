/**
 * POST /api/portal/admin/todos/:id/attachments/confirm
 *   body: { attachment_id, storage_path, file_name, mime_type, size_bytes }
 *
 * Run after the browser has PUT the file bytes to the signed URL from /sign.
 * We HEAD the bucket to confirm the object really exists at the expected
 * path (so a client can't fake a confirm without uploading), then insert
 * the owner_todo_attachments row.
 *
 * On failure we best-effort remove the object so the bucket doesn't keep
 * an orphan blob.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../../lib/session';

const BUCKET = 'owner-todo-attachments';
const MAX_BYTES = 100 * 1024 * 1024;

const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/', 'text/'];
const ALLOWED_MIME_EXACT = new Set([
  'application/pdf',
  'application/json',
  'application/xml',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
  'application/x-7z-compressed',
  'application/rtf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/octet-stream',
  '',
]);

function isAllowedMime(m: string): boolean {
  if (ALLOWED_MIME_EXACT.has(m)) return true;
  return ALLOWED_MIME_PREFIXES.some((p) => m.startsWith(p));
}

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const todoId = params.id;
  if (!todoId) return json({ error: 'Missing id' }, 400);

  let body: {
    attachment_id?: string;
    storage_path?: string;
    file_name?: string;
    mime_type?: string;
    size_bytes?: number;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const { attachment_id, storage_path, file_name, mime_type, size_bytes } = body;
  if (!attachment_id || !storage_path || !file_name) {
    return json({ error: 'Missing fields' }, 400);
  }
  if (typeof size_bytes !== 'number' || size_bytes <= 0 || size_bytes > MAX_BYTES) {
    return json({ error: 'Invalid size_bytes' }, 400);
  }
  const mt = mime_type ?? '';
  if (!isAllowedMime(mt)) return json({ error: `Unsupported file type: ${mt}` }, 415);

  // The storage_path must start with the caller's user id — otherwise the
  // client constructed a path pointing somewhere they don't own.
  const expectedPrefix = `${session.userId}/${todoId}/${attachment_id}-`;
  if (!storage_path.startsWith(expectedPrefix)) {
    return json({ error: 'storage_path mismatch' }, 400);
  }

  const admin = createServiceSupabase();

  // Confirm the todo still belongs to the calling admin.
  const { data: todo } = await admin
    .from('owner_todos')
    .select('id')
    .eq('id', todoId)
    .eq('owner_id', session.userId)
    .maybeSingle();
  if (!todo) return json({ error: 'Not found' }, 404);

  // Sanity check: the object actually exists at the path. Storage SDK
  // doesn't expose a HEAD, so we list the parent folder filtered by the
  // attachment_id prefix.
  const folder = `${session.userId}/${todoId}`;
  const { data: listed, error: listErr } = await admin.storage
    .from(BUCKET)
    .list(folder, { search: `${attachment_id}-`, limit: 1 });
  if (listErr) return json({ error: listErr.message }, 500);
  if (!listed || listed.length === 0) {
    return json({ error: 'Upload not found in storage' }, 409);
  }

  const { data: row, error: insErr } = await admin
    .from('owner_todo_attachments')
    .insert({
      id: attachment_id,
      todo_id: todoId,
      owner_id: session.userId,
      storage_path,
      file_name,
      mime_type: mt || 'application/octet-stream',
      size_bytes,
    })
    .select('id, todo_id, file_name, mime_type, size_bytes, storage_path, created_at')
    .single();

  if (insErr || !row) {
    // Don't leave an orphaned object on a failed insert.
    await admin.storage.from(BUCKET).remove([storage_path]);
    return json({ error: insErr?.message ?? 'Insert failed' }, 500);
  }

  await admin
    .from('owner_todos')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', todoId)
    .eq('owner_id', session.userId);

  return json({ attachment: row });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
