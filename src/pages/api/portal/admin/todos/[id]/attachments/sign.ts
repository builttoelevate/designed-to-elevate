/**
 * POST /api/portal/admin/todos/:id/attachments/sign
 *   body: { file_name, mime_type, size_bytes }
 *
 * Generates a short-lived signed upload URL pointing at Supabase Storage so
 * the browser can PUT the file bytes directly. Files never pass through our
 * serverless function (Vercel caps multipart bodies at 4.5 MB).
 *
 * The follow-up call is /attachments/confirm, which records the row only
 * after the object actually exists in the bucket.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../../lib/session';

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
const BUCKET = 'owner-todo-attachments';
const MAX_FILENAME = 200;

// Permissive but not wide-open. Owner-only feature; we mostly want to keep
// browser-served executables and exotic mismatches out of the bucket.
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
  // Common fallback for files the browser couldn't classify (often code/text).
  'application/octet-stream',
  // Empty string can come through when a browser declines to set Content-Type.
  '',
]);

function isAllowedMime(m: string): boolean {
  if (ALLOWED_MIME_EXACT.has(m)) return true;
  return ALLOWED_MIME_PREFIXES.some((p) => m.startsWith(p));
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, MAX_FILENAME) || 'file';
}

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const todoId = params.id;
  if (!todoId) return json({ error: 'Missing id' }, 400);

  let body: { file_name?: string; mime_type?: string; size_bytes?: number };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const fileName = (body.file_name ?? '').trim();
  if (!fileName) return json({ error: 'file_name required' }, 400);
  if (fileName.length > MAX_FILENAME) {
    return json({ error: `file_name too long (${MAX_FILENAME} max)` }, 400);
  }

  const mimeType = (body.mime_type ?? '').trim();
  if (!isAllowedMime(mimeType)) {
    return json({ error: `Unsupported file type: ${mimeType || 'unknown'}` }, 415);
  }

  const sizeBytes = body.size_bytes;
  if (typeof sizeBytes !== 'number' || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return json({ error: 'size_bytes must be a positive number' }, 400);
  }
  if (sizeBytes > MAX_BYTES) {
    return json({ error: `File exceeds 100 MB limit (${sizeBytes} bytes)` }, 413);
  }

  const admin = createServiceSupabase();

  // Confirm the todo belongs to the calling admin so we never sign a URL
  // pointing into someone else's folder.
  const { data: todo } = await admin
    .from('owner_todos')
    .select('id')
    .eq('id', todoId)
    .eq('owner_id', session.userId)
    .maybeSingle();
  if (!todo) return json({ error: 'Not found' }, 404);

  const attachmentId = crypto.randomUUID();
  const storagePath = `${session.userId}/${todoId}/${attachmentId}-${safeName(fileName)}`;

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return json({ error: error?.message ?? 'Could not sign URL' }, 500);
  }

  return json({
    attachment_id: attachmentId,
    storage_path: storagePath,
    signed_url: data.signedUrl,
    token: data.token,
  });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
