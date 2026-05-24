/**
 * POST /api/portal/requests/:id/comments  { body, visibility? }
 *
 * Clients can only post visibility = 'public'. Admins can post 'internal'
 * notes that clients never see. RLS enforces this at the database level;
 * we also validate at the API layer for friendly error messages.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase, createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';
import { isClientNotificationEnabled } from '../../../../../lib/notifications';
import { sendNewMessageEmail } from '../../../../../lib/email';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) return json({ error: 'Not signed in' }, 401);

  const id = params.id;
  if (!id) return json({ error: 'Missing request id' }, 400);

  let payload: { body?: string; visibility?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const body = (payload.body || '').trim();
  if (!body) return json({ error: 'Empty message' }, 400);

  const visibility = payload.visibility === 'internal' ? 'internal' : 'public';
  if (visibility === 'internal' && session.role !== 'admin') {
    return json({ error: 'Only admins can post internal notes' }, 403);
  }

  const supabase = createServerSupabase({ cookies, request });
  const { error: insertErr } = await supabase.from('comments').insert({
    request_id: id,
    author_id: session.userId,
    body,
    visibility,
  });
  if (insertErr) return json({ error: insertErr.message }, 500);

  const admin = createServiceSupabase();
  await admin.from('request_activity').insert({
    request_id: id,
    actor_id: session.userId,
    action: 'comment_added',
    metadata: { visibility },
  });

  // Email the client when an admin posts a client-visible message — gated by
  // this client's 'new_message' preference (off by default). Internal notes
  // and client-authored comments never trigger it.
  if (session.role === 'admin' && visibility === 'public') {
    await notifyClientNewMessage(admin, id, body);
  }

  return json({ ok: true });
};

async function notifyClientNewMessage(
  admin: ReturnType<typeof createServiceSupabase>,
  requestId: string,
  body: string
) {
  try {
    const { data: req } = await admin
      .from('requests')
      .select('title, client_id')
      .eq('id', requestId)
      .maybeSingle();
    if (!req) return;

    if (!(await isClientNotificationEnabled(admin, req.client_id, 'new_message'))) return;

    const { data: client } = await admin
      .from('clients')
      .select('primary_contact_email')
      .eq('id', req.client_id)
      .maybeSingle();
    if (!client?.primary_contact_email) return;

    const { data: members } = await admin
      .from('client_users')
      .select('profiles:user_id (full_name)')
      .eq('client_id', req.client_id);
    const owner = (members ?? []).map((m: any) => m.profiles).find(Boolean);
    const firstName =
      typeof owner?.full_name === 'string' && owner.full_name.trim()
        ? owner.full_name.trim().split(/\s+/)[0]
        : 'there';

    const preview = body.length > 160 ? `${body.slice(0, 160)}…` : body;

    await sendNewMessageEmail({
      toEmail: client.primary_contact_email,
      firstName,
      title: req.title,
      requestId,
      preview,
    });
  } catch (err) {
    console.error('[comments] new-message email failed:', err);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
