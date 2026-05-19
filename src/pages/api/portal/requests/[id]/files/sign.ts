/**
 * POST /api/portal/requests/:id/files/sign
 *   body: { file_name, mime_type, size_bytes }
 *
 * Mints a signed Supabase Storage upload URL for one file attached to a
 * client change-request. Browser then PUTs the bytes directly to Supabase,
 * watches xhr.upload.onprogress for per-file progress, and calls the
 * sibling /files/confirm endpoint to record the metadata row.
 *
 * The storage path's first segment is the caller's client_id so the
 * `request_files_insert` bucket policy authorizes the PUT under the user's
 * session.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILENAME,
  isAllowedMime,
  safeName,
} from '../../../../../../lib/file-uploads';

const BUCKET = 'request-files';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) return json({ error: 'Not signed in' }, 401);
  if (session.clientIds.length === 0) {
    return json({ error: 'No client linked to this account' }, 403);
  }

  const requestId = params.id;
  if (!requestId) return json({ error: 'Missing id' }, 400);

  let body: { file_name?: string; mime_type?: string; size_bytes?: number };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const fileName = (body.file_name ?? '').trim();
  if (!fileName) return json({ error: 'file_name required' }, 400);
  if (fileName.length > MAX_UPLOAD_FILENAME) {
    return json({ error: `file_name too long (${MAX_UPLOAD_FILENAME} max)` }, 400);
  }

  const mimeType = (body.mime_type ?? '').trim();
  if (!isAllowedMime(mimeType)) {
    return json({ error: `Unsupported file type: ${mimeType || 'unknown'}` }, 415);
  }

  const sizeBytes = body.size_bytes;
  if (typeof sizeBytes !== 'number' || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return json({ error: 'size_bytes must be a positive number' }, 400);
  }
  if (sizeBytes > MAX_UPLOAD_BYTES) {
    return json({ error: `File exceeds 100 MB limit (${sizeBytes} bytes)` }, 413);
  }

  const admin = createServiceSupabase();

  // Confirm the request belongs to the caller's client AND is still in the
  // `new` state. Late uploads after admin triage would surprise the owner;
  // route those through the detail page instead (out of scope here).
  const clientId = session.clientIds[0];
  const { data: existing } = await admin
    .from('requests')
    .select('id, status')
    .eq('id', requestId)
    .eq('client_id', clientId)
    .maybeSingle();
  if (!existing) return json({ error: 'Not found' }, 404);
  if (existing.status && existing.status !== 'new') {
    return json({ error: 'Request is no longer accepting new uploads' }, 409);
  }

  const attachmentId = crypto.randomUUID();
  const storagePath = `${clientId}/${requestId}/${attachmentId}-${safeName(fileName)}`;

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
