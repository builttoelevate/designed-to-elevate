/**
 * POST /api/portal/admin/requests/bulk-status  { ids: string[], status }
 *
 * Admin-only. Updates many requests' status in one call. Per-request, this
 * mirrors the single-request PATCH at ./[id]/index.ts: it reads the previous
 * status, updates, writes a request_activity row, and fires the same client
 * notification emails on transitions into `waiting_on_client` or `complete`.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';
import {
  sendStatusWaitingOnClientEmail,
  sendJobCompleteEmail,
} from '../../../../../lib/email';
import { isClientNotificationEnabled } from '../../../../../lib/notifications';

const ALLOWED_STATUSES = new Set(['new', 'in_progress', 'waiting_on_client', 'complete']);
const MAX_BULK = 200;

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  let body: { ids?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const status = typeof body.status === 'string' ? body.status : '';
  if (!ALLOWED_STATUSES.has(status)) return json({ error: 'Invalid status' }, 400);

  const rawIds = Array.isArray(body.ids) ? body.ids : [];
  const ids = Array.from(new Set(rawIds.filter((v): v is string => typeof v === 'string' && v.length > 0)));
  if (ids.length === 0) return json({ error: 'No ids' }, 400);
  if (ids.length > MAX_BULK) return json({ error: `Too many ids (max ${MAX_BULK})` }, 400);

  const admin = createServiceSupabase();

  // Snapshot prior state so we can log clean transitions and skip no-ops.
  const { data: before, error: beforeErr } = await admin
    .from('requests')
    .select('id, status, client_id, title')
    .in('id', ids);
  if (beforeErr) return json({ error: beforeErr.message }, 500);

  const beforeMap = new Map((before ?? []).map((r) => [r.id, r]));
  const foundIds = ids.filter((id) => beforeMap.has(id));
  if (foundIds.length === 0) return json({ error: 'Not found' }, 404);

  // Single bulk update — RLS bypassed by service role.
  const { error: updateErr } = await admin.from('requests').update({ status }).in('id', foundIds);
  if (updateErr) return json({ error: updateErr.message }, 500);

  // Activity log + notifications per transitioning row. Skip no-ops.
  const activityRows: Array<{ request_id: string; actor_id: string; action: string; metadata: any }> = [];
  for (const id of foundIds) {
    const prev = beforeMap.get(id)!;
    if (prev.status === status) continue;
    activityRows.push({
      request_id: id,
      actor_id: session.userId,
      action: 'status_changed',
      metadata: { from: prev.status, to: status },
    });
    if (status === 'waiting_on_client') {
      void notifyClient(id, prev.client_id, prev.title, 'waiting_on_client');
    } else if (status === 'complete') {
      void notifyClient(id, prev.client_id, prev.title, 'complete');
    }
  }
  if (activityRows.length) {
    await admin.from('request_activity').insert(activityRows);
  }

  return json({ ok: true, updated: foundIds.length, transitioned: activityRows.length });
};

async function notifyClient(
  requestId: string,
  clientId: string,
  title: string,
  kind: 'waiting_on_client' | 'complete'
) {
  try {
    const admin = createServiceSupabase();

    const key = kind === 'complete' ? 'job_complete' : 'status_waiting_on_client';
    if (!(await isClientNotificationEnabled(admin, clientId, key))) return;

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
    console.error('[admin.requests.bulk-status] notification failed:', err);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
