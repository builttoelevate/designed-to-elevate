/**
 * PATCH /api/portal/admin/requests/:id  { status?, priority?, billing_type? }
 *
 * Admin-only. Updates a request via service role (RLS would still allow it
 * since admin policies grant access, but using service role here keeps the
 * server in control and lets us write activity + send emails atomically).
 *
 * Email policy:
 *   - status → waiting_on_client : "we need one more thing" (gated)
 *   - status → complete          : "your job is done" (gated)
 *   - status → in_progress / new : silent
 *   - priority bumped UP on a non-complete job : "heads up, urgency went up"
 *     (gated). A priority bump that happens in the SAME PATCH as a status
 *     change to waiting_on_client is suppressed — the waiting-on-you email
 *     already surfaces the new urgency, so we don't double-email.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';
import {
  sendStatusWaitingOnClientEmail,
  sendJobCompleteEmail,
  sendUrgencyEscalatedEmail,
} from '../../../../../../lib/email';
import { isClientNotificationEnabled } from '../../../../../../lib/notifications';
import { priorityLabel, priorityRank } from '../../../../../../lib/portal';

const ALLOWED_STATUSES = new Set(['new', 'in_progress', 'waiting_on_client', 'complete']);
const ALLOWED_PRIORITIES = new Set(['normal', 'important', 'urgent']);
const ALLOWED_BILLING = new Set(['included', 'billable', 'needs_estimate', 'courtesy']);

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  let body: { status?: string; priority?: string; billing_type?: string };
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
  if (body.priority) {
    if (!ALLOWED_PRIORITIES.has(body.priority)) return json({ error: 'Invalid priority' }, 400);
    updates.priority = body.priority;
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
    .select('status, priority, billing_type, client_id, title')
    .eq('id', id)
    .maybeSingle();

  if (!before) return json({ error: 'Not found' }, 404);

  const { error: updateErr } = await admin.from('requests').update(updates).eq('id', id);
  if (updateErr) return json({ error: updateErr.message }, 500);

  // Resolve the "after" state once. Anything not in the patch keeps its prior
  // value — used downstream to decide which email (if any) to send.
  const afterStatus = (updates.status ?? before.status) as string;
  const afterPriority = (updates.priority ?? before.priority) as string;

  const statusTransitioned = updates.status !== undefined && updates.status !== before.status;
  const priorityTransitioned = updates.priority !== undefined && updates.priority !== before.priority;
  const priorityEscalated =
    priorityTransitioned && priorityRank(afterPriority) > priorityRank(before.priority);

  // Activity log, one entry per changed field.
  for (const [field, value] of Object.entries(updates)) {
    let action: string;
    if (field === 'status') action = 'status_changed';
    else if (field === 'priority') action = 'priority_changed';
    else action = 'billing_changed';

    await admin.from('request_activity').insert({
      request_id: id,
      actor_id: session.userId,
      action,
      metadata: { from: (before as any)[field], to: value },
    });
  }

  // Status emails — only fire on a real transition into the state.
  if (statusTransitioned) {
    if (afterStatus === 'waiting_on_client') {
      void notifyStatus(id, before.client_id, before.title, 'waiting_on_client', afterPriority);
    } else if (afterStatus === 'complete') {
      void notifyStatus(id, before.client_id, before.title, 'complete', afterPriority);
    }
  }

  // Urgency escalation email — fires when priority went UP on an active job.
  // Suppressed when this same PATCH transitions into waiting_on_client (the
  // waiting-on-you email already surfaces the new urgency) and on completed
  // jobs (nothing to do anymore).
  const suppressEscalation =
    statusTransitioned && afterStatus === 'waiting_on_client';
  if (priorityEscalated && afterStatus !== 'complete' && !suppressEscalation) {
    void notifyUrgencyBump(
      id,
      before.client_id,
      before.title,
      before.priority,
      afterPriority,
      afterStatus === 'waiting_on_client',
    );
  }

  return json({ ok: true });
};

async function loadRecipient(clientId: string) {
  const admin = createServiceSupabase();
  const { data: client } = await admin
    .from('clients')
    .select('business_name, primary_contact_email')
    .eq('id', clientId)
    .maybeSingle();
  if (!client?.primary_contact_email) return null;

  const { data: members } = await admin
    .from('client_users')
    .select('profiles:user_id (full_name)')
    .eq('client_id', clientId);
  const owner = (members ?? []).map((m: any) => m.profiles).find(Boolean);
  const firstName =
    typeof owner?.full_name === 'string' && owner.full_name.trim()
      ? owner.full_name.trim().split(/\s+/)[0]
      : 'there';

  return { toEmail: client.primary_contact_email, firstName };
}

async function notifyStatus(
  requestId: string,
  clientId: string,
  title: string,
  kind: 'waiting_on_client' | 'complete',
  priority: string,
) {
  try {
    const admin = createServiceSupabase();
    const key = kind === 'complete' ? 'job_complete' : 'status_waiting_on_client';
    if (!(await isClientNotificationEnabled(admin, clientId, key))) return;

    const recipient = await loadRecipient(clientId);
    if (!recipient) return;

    const payload = {
      ...recipient,
      title,
      requestId,
      urgencyLabel: priorityLabel(priority),
    };

    if (kind === 'complete') {
      await sendJobCompleteEmail(payload);
    } else {
      await sendStatusWaitingOnClientEmail(payload);
    }
  } catch (err) {
    console.error('[admin.requests] status notification failed:', err);
  }
}

async function notifyUrgencyBump(
  requestId: string,
  clientId: string,
  title: string,
  fromPriority: string,
  toPriority: string,
  waitingOnClient: boolean,
) {
  try {
    const admin = createServiceSupabase();
    if (!(await isClientNotificationEnabled(admin, clientId, 'urgency_escalated'))) return;

    const recipient = await loadRecipient(clientId);
    if (!recipient) return;

    await sendUrgencyEscalatedEmail({
      ...recipient,
      title,
      requestId,
      fromLabel: priorityLabel(fromPriority),
      toLabel: priorityLabel(toPriority),
      waitingOnClient,
    });
  } catch (err) {
    console.error('[admin.requests] urgency notification failed:', err);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
