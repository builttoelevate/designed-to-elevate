/**
 * POST /api/portal/requests   (multipart/form-data)
 *
 * Client-side request submission. Inserts the requests row using the user's
 * session (RLS enforces tenant scoping), uploads any attached files into
 * storage under <client_id>/<request_id>/, writes request_files rows via the
 * service role, logs activity, and triggers notification emails.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase, createServiceSupabase } from '../../../../lib/supabase';
import { getPortalSession } from '../../../../lib/session';
import {
  sendRequestReceivedEmail,
  sendAdminNewRequestEmail,
} from '../../../../lib/email';

const ALLOWED_CATEGORIES = new Set(['text', 'image', 'layout', 'new_feature', 'broken']);
const ALLOWED_PRIORITIES = new Set(['normal', 'important', 'urgent']);

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session) {
    console.warn('[requests] no session on POST /api/portal/requests');
    return json({ error: 'Not signed in' }, 401);
  }
  if (session.clientIds.length === 0) {
    console.warn('[requests] user has no client_users links', { userId: session.userId });
    return json({ error: 'No client linked to this account' }, 403);
  }

  // Clients submit against their (currently single) linked client. If multi-
  // client support comes later, pass a client_id field and validate.
  const clientId = session.clientIds[0];

  const form = await request.formData();
  const title = (form.get('title') as string || '').trim();
  const description = (form.get('description') as string || '').trim();
  const category = (form.get('category') as string || '').trim();
  const priority = ((form.get('priority') as string) || 'normal').trim();
  const pageUrl = ((form.get('page_url') as string) || '').trim() || null;
  const completionDate = ((form.get('preferred_completion_date') as string) || '').trim() || null;

  if (!title || !description || !category) {
    return json({ error: 'Title, category, and description are required' }, 400);
  }
  if (!ALLOWED_CATEGORIES.has(category)) return json({ error: 'Invalid category' }, 400);
  if (!ALLOWED_PRIORITIES.has(priority)) return json({ error: 'Invalid priority' }, 400);

  const supabase = createServerSupabase(cookies);

  // Confirm the server-side Supabase client is actually carrying the user's
  // session before we attempt the insert. If auth.uid() is null here, the
  // cookie didn't propagate — log it so we can see in Vercel function logs.
  const { data: whoami, error: whoErr } = await supabase.auth.getUser();
  if (whoErr || !whoami?.user) {
    console.error('[requests] supabase.auth.getUser failed', {
      sessionUserId: session.userId,
      err: whoErr?.message,
    });
    return json({ error: 'Session expired — please sign out and back in' }, 401);
  }
  if (whoami.user.id !== session.userId) {
    console.error('[requests] auth.uid() mismatch with session', {
      authUid: whoami.user.id,
      sessionUserId: session.userId,
    });
  }

  const insertPayload = {
    client_id: clientId,
    submitted_by: session.userId,
    title,
    description,
    category,
    priority,
    page_url: pageUrl,
    preferred_completion_date: completionDate,
  };

  const { data: created, error: insertErr } = await supabase
    .from('requests')
    .insert(insertPayload)
    .select('id, title')
    .single();

  if (insertErr || !created) {
    console.error('[requests] insert failed', {
      authUid: whoami.user.id,
      payload: insertPayload,
      err: insertErr,
    });
    return json({ error: insertErr?.message || 'Could not create request' }, 500);
  }

  // Upload any attached files via service role. We've already verified the
  // caller's identity above; using service role here means we can write into
  // storage and request_files in the same path even when the user's RLS join
  // is slightly delayed.
  const admin = createServiceSupabase();

  const files = form.getAll('files').filter((v): v is File => v instanceof File && v.size > 0);
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `${clientId}/${created.id}/${Date.now()}-${safeName}`;
    const buffer = await file.arrayBuffer();

    const { error: upErr } = await admin.storage
      .from('request-files')
      .upload(objectPath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
    if (upErr) continue; // skip the bad one rather than failing the whole submit

    await admin.from('request_files').insert({
      request_id: created.id,
      file_url: objectPath, // store the object path; sign at read time
      filename: file.name,
      uploaded_by: session.userId,
    });
  }

  // Activity log.
  await admin.from('request_activity').insert({
    request_id: created.id,
    actor_id: session.userId,
    action: 'request_created',
    metadata: { title: created.title },
  });

  // Notifications — fire and continue; never block the user on email.
  void sendNotifications(created.id, clientId, created.title);

  return json({ ok: true, id: created.id });
};

async function sendNotifications(requestId: string, clientId: string, title: string) {
  try {
    const admin = createServiceSupabase();

    const [{ data: client }, { data: members }] = await Promise.all([
      admin.from('clients').select('business_name, primary_contact_email').eq('id', clientId).maybeSingle(),
      admin
        .from('client_users')
        .select('profiles:user_id (id, full_name)')
        .eq('client_id', clientId),
    ]);

    if (!client) return;

    const owner = (members ?? []).map((m: any) => m.profiles).find(Boolean);

    await Promise.all([
      sendRequestReceivedEmail({
        toEmail: client.primary_contact_email,
        firstName: ownerFirstName(owner),
        title,
        requestId,
      }),
      sendAdminNewRequestEmail({
        clientName: client.business_name,
        title,
        requestId,
      }),
    ]);
  } catch (err) {
    console.error('[requests] notification failed:', err);
  }
}

function ownerFirstName(owner: any): string {
  const name = owner?.full_name;
  if (typeof name === 'string' && name.trim()) return name.trim().split(/\s+/)[0];
  return 'there';
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
