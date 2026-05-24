/**
 * DELETE /api/portal/requests/:id/files/:fileId
 *
 * Removes an attachment from a request — the storage object and the
 * request_files row. Shared by admin and client; authorization differs:
 *
 *   - Admin: may remove any file on any request.
 *   - Client: may remove a file on their OWN request, but NOT an
 *     admin-uploaded file. Completion screenshots are deliverables/proof of
 *     work, so a client can clear their own reference images without being
 *     able to delete what the studio attached.
 *
 * Service role throughout (bypasses RLS) after the ownership/role checks
 * above — same pattern as the upload endpoint and the todos attachment
 * delete.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) return json({ error: 'Not signed in' }, 401);

  const requestId = params.id;
  const fileId = params.fileId;
  if (!requestId || !fileId) return json({ error: 'Missing id' }, 400);

  const admin = createServiceSupabase();

  const { data: file } = await admin
    .from('request_files')
    .select('id, request_id, file_url, requests:request_id (client_id), uploader:uploaded_by (role)')
    .eq('id', fileId)
    .maybeSingle();

  if (!file || file.request_id !== requestId) return json({ error: 'Not found' }, 404);

  const clientId = (file as any).requests?.client_id as string | undefined;
  const uploaderIsAdmin = (file as any).uploader?.role === 'admin';

  if (session.role !== 'admin') {
    // Client path: must own the request and may not delete admin uploads.
    if (!clientId || !session.clientIds.includes(clientId)) {
      return json({ error: 'Not found' }, 404);
    }
    if (uploaderIsAdmin) {
      return json({ error: "You can't remove files uploaded by Designed to Elevate." }, 403);
    }
  }

  // Storage first; if the row delete fails after, a retry's storage remove()
  // is a harmless no-op.
  await admin.storage.from('request-files').remove([file.file_url]);

  const { error: delErr } = await admin
    .from('request_files')
    .delete()
    .eq('id', fileId);
  if (delErr) return json({ error: delErr.message }, 500);

  await admin.from('request_activity').insert({
    request_id: requestId,
    actor_id: session.userId,
    action: 'file_removed',
    metadata: {},
  });

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
