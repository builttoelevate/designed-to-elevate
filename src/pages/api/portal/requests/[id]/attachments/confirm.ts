/**
 * POST /api/portal/requests/:id/attachments/confirm
 *   body: { attachment_id, storage_path, file_name, mime_type, size_bytes }
 *
 * Browser calls this after a successful PUT to the signed upload URL from
 * /attachments/sign. We:
 *   1. Re-verify caller owns the request and it's still in `new` state.
 *   2. Re-validate MIME + size (defense in depth — the browser is untrusted).
 *   3. Confirm the storage_path starts with the expected
 *      <client_id>/<request_id>/<attachment_id>- prefix.
 *   4. HEAD-equivalent: list the bucket folder filtered by attachment_id to
 *      confirm the object actually landed. Phantom rows from a signed-but-
 *      never-uploaded path would otherwise leak through.
 *   5. Idempotency: if a request_files row already exists for this
 *      (request_id, file_url) pair, return success without inserting again.
 *      Lets the retry button safely re-run this endpoint after a network
 *      blip between PUT and confirm.
 *   6. Insert the request_files row.
 *
 * Emails are NOT fired here — they fire inline on the initial /requests POST,
 * so a flaky upload doesn't suppress them and a retry doesn't risk a
 * duplicate send.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';
import { MAX_UPLOAD_BYTES, isAllowedMime } from '../../../../../../lib/file-uploads';

const BUCKET = 'request-files';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) return json({ error: 'Not signed in' }, 401);
  if (session.clientIds.length === 0) {
    return json({ error: 'No client linked to this account' }, 403);
  }

  const requestId = params.id;
  if (!requestId) return json({ error: 'Missing id' }, 400);

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
    return json({ error: 'attachment_id, storage_path, file_name required' }, 400);
  }

  const mimeType = (mime_type ?? '').trim();
  if (!isAllowedMime(mimeType)) {
    return json({ error: `Unsupported file type: ${mimeType || 'unknown'}` }, 415);
  }
  if (
    typeof size_bytes !== 'number' ||
    !Number.isFinite(size_bytes) ||
    size_bytes <= 0 ||
    size_bytes > MAX_UPLOAD_BYTES
  ) {
    return json({ error: 'size_bytes invalid' }, 400);
  }

  const admin = createServiceSupabase();
  const clientId = session.clientIds[0];

  // The path the browser claims to have written must match the prefix we'd
  // have signed in /attachments/sign — otherwise we'd be recording a file we
  // never authorized this caller to write.
  const expectedPrefix = `${clientId}/${requestId}/${attachment_id}-`;
  if (!storage_path.startsWith(expectedPrefix)) {
    return json({ error: 'storage_path mismatch' }, 400);
  }

  // Re-check request ownership + state. Skipping this would let a client
  // attach files to a completed request via a leftover signed URL.
  const { data: existing } = await admin
    .from('requests')
    .select('id, status, client_id')
    .eq('id', requestId)
    .eq('client_id', clientId)
    .maybeSingle();
  if (!existing) return json({ error: 'Not found' }, 404);
  if (existing.status && existing.status !== 'new') {
    return json({ error: 'Request is no longer accepting new uploads' }, 409);
  }

  // Idempotency: if the browser is retrying this confirm (after a successful
  // PUT but a failed/timed-out earlier confirm round-trip), return the
  // existing row instead of inserting again. No unique constraint exists on
  // request_files(request_id, file_url), so this SELECT-then-skip pattern is
  // how we keep retries safe without a migration.
  const { data: alreadyConfirmed } = await admin
    .from('request_files')
    .select('id, filename')
    .eq('request_id', requestId)
    .eq('file_url', storage_path)
    .maybeSingle();
  if (alreadyConfirmed) {
    return json({ ok: true, file: alreadyConfirmed, deduplicated: true });
  }

  // Confirm the blob exists where the browser claims it does. list() with a
  // search filter is the closest thing to HEAD that the Supabase JS client
  // exposes for storage.
  const folder = `${clientId}/${requestId}`;
  const { data: listed, error: listErr } = await admin.storage
    .from(BUCKET)
    .list(folder, { search: `${attachment_id}-`, limit: 1 });
  if (listErr || !listed || listed.length === 0) {
    return json({ error: 'Upload not found in storage' }, 409);
  }

  const { data: row, error: insertErr } = await admin
    .from('request_files')
    .insert({
      request_id: requestId,
      file_url: storage_path,
      filename: file_name,
      uploaded_by: session.userId,
    })
    .select('id, filename')
    .single();

  if (insertErr || !row) {
    // Clean the orphan blob so it doesn't sit in the bucket without a row
    // pointing at it. Best-effort; ignore the cleanup result.
    await admin.storage.from(BUCKET).remove([storage_path]);
    return json({ error: insertErr?.message ?? 'Could not record file' }, 500);
  }

  return json({ ok: true, file: row });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
