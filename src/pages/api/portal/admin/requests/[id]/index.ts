/**
 * PATCH /api/portal/admin/requests/:id  { status?, billing_type? }
 *
 * Admin-only. Updates a request via service role (RLS would still allow it
 * since admin policies grant access, but using service role here keeps the
 * server in control and lets us write activity + send emails atomically).
 *
 * Email policy: `waiting_on_client` emails the client ("we need something
 * from you") and `complete` emails the client ("your job is done").
 * `in_progress` stays silent — the portal shows that state and the inbox
 * stays signal-only.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';
import {
  sendStatusWaitingOnClientEmail,
  sendJobCompleteEmail,
} from '../../../../../../lib/email';

const ALLOWED_STATUSES = new Set(['new', 'in_progress', 'waiting_on_client', 'complete']);
const ALLOWED_BILLING = new Set(['included', 'billable', 'needs_estimate', 'courtesy']);

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  let body: { status?: string; billing_type?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const updates: Record<string, string> = {};
  if (body.status) {
    if (!ALLOWED_STATUSES.has(body.status)) return json({ error: 'Invalid status' }, 400);
    updates.status = body.status;
  }
  if (body.billing_type) {
    if (!ALLOWED_BILLING.has(body.billing_type)) return json({ error: 'Invalid billing_type' }, 400);
    updates.billing_type = body.billing_type;
  }
  if (Object.keys(updates).length === 0) return json({ error: 'Nothing to update' }, 400);

  const admin = createServiceSupabase();

  // Read the previous state so we can log a clean transition.
  const { data: before } = await admin
    .from('requests')
    .select('status, billing_type, client_id, title')
    .eq('id', id)
    .maybeSingle();

  if (!before) return json({ error: 'Not found' }, 404);

  const { error: updateErr } = await admin.from('requests').update(updates).eq('id', id);
  if (updateErr) return json({ error: updateErr.message }, 500);

  // Activity log + notifications, one entry per changed field.
  for (const [field, value] of Object.entries(updates)) {
    await admin.from('request_activity').insert({
      request_id: id,
      actor_id: session.userId,
      action: field === 'status' ? 'status_changed' : 'billing_changed',
      metadata: { from: (before as any)[field], to: value },
    });

    // Status emails — see policy comment at top. Only fire on an actual
    // transition into the state, not on a no-op re-save.
    if (field === 'status' && value !== (before as any).status) {
      if (value === 'waiting_on_client') {
        void notifyClient(id, before.client_id, before.title, 'waiting_on_client');
      } else if (value === 'complete') {
        void notifyClient(id, before.client_id, before.title, 'complete');
      }
    }
  }

  return json({ ok: true });
};

async function notifyClient(
  requestId: string,
  clientId: string,
  title: string,
  kind: 'waiting_on_client' | 'complete'
) {
  try {
    const admin = createServiceSupabase();
    const { data: client } = await admin
      .from('clients')
      .select('business_name, primary_contact_email')
      .eq('id', clientId)
      .maybeSingle();
    if (!client) return;

    const { data: members } = await admin
      .from('client_users')
      .select('profiles:user_id (full_name)')
      .eq('client_id', clientId);
    const owner = (members ?? []).map((m: any) => m.profiles).find(Boolean);
    const firstName =
      typeof owner?.full_name === 'string' && owner.full_name.trim()
        ? owner.full_name.trim().split(/\s+/)[0]
        : 'there';

    const payload = {
      toEmail: client.primary_contact_email,
      firstName,
      title,
      requestId,
    };

    if (kind === 'complete') {
      await sendJobCompleteEmail(payload);
    } else {
      await sendStatusWaitingOnClientEmail(payload);
    }
  } catch (err) {
    console.error('[admin.requests] notification failed:', err);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
