/**
 * POST /api/portal/admin/requests/:id/files   (multipart/form-data)
 *
 * Admin file uploads (e.g. completion screenshots). Files attach to the
 * request and become visible to the client.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  const form = await request.formData();
  const files = form.getAll('files').filter((v): v is File => v instanceof File && v.size > 0);
  if (files.length === 0) return json({ error: 'No files' }, 400);

  const admin = createServiceSupabase();
  const { data: req } = await admin.from('requests').select('client_id').eq('id', id).maybeSingle();
  if (!req) return json({ error: 'Request not found' }, 404);

  for (const file of files) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `${req.client_id}/${id}/${Date.now()}-${safe}`;
    const buffer = await file.arrayBuffer();
    const { error: upErr } = await admin.storage
      .from('request-files')
      .upload(objectPath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
    if (upErr) continue;
    await admin.from('request_files').insert({
      request_id: id,
      file_url: objectPath,
      filename: file.name,
      uploaded_by: session.userId,
    });
  }

  await admin.from('request_activity').insert({
    request_id: id,
    actor_id: session.userId,
    action: 'file_uploaded',
    metadata: { count: files.length },
  });

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
