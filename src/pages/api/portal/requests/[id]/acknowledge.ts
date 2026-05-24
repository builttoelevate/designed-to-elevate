/**
 * POST /api/portal/requests/:id/acknowledge
 *
 * Client confirms they've read the instructions on a job. Stamps
 * instructions_ack_at = now() so the admin can see the client has seen it.
 *
 * Done via service role after verifying the caller owns the request: the
 * `requests_update_own_while_new` RLS policy only lets clients update their
 * own request while status = 'new', but an admin-logged job carrying
 * instructions may already be in_progress/complete when the client
 * acknowledges. Verifying ownership here and writing with service role keeps
 * the acknowledgment working at any status without loosening the policy.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) return json({ error: 'Not signed in' }, 401);
  if (session.clientIds.length === 0) {
    return json({ error: 'No client linked to this account' }, 403);
  }

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  const admin = createServiceSupabase();

  // Verify the request belongs to the caller's client and actually carries
  // instructions worth acknowledging.
  const { data: req } = await admin
    .from('requests')
    .select('id, client_id, instructions, instructions_ack_at')
    .eq('id', id)
    .maybeSingle();

  if (!req || !session.clientIds.includes(req.client_id)) {
    return json({ error: 'Not found' }, 404);
  }
  if (!req.instructions) {
    return json({ error: 'No instructions to acknowledge' }, 400);
  }

  // Idempotent: if already acknowledged, return the existing timestamp.
  if (req.instructions_ack_at) {
    return json({ ok: true, acknowledged_at: req.instructions_ack_at });
  }

  const acknowledgedAt = new Date().toISOString();
  const { error: updateErr } = await admin
    .from('requests')
    .update({ instructions_ack_at: acknowledgedAt })
    .eq('id', id);
  if (updateErr) return json({ error: updateErr.message }, 500);

  await admin.from('request_activity').insert({
    request_id: id,
    actor_id: session.userId,
    action: 'instructions_acknowledged',
    metadata: {},
  });

  return json({ ok: true, acknowledged_at: acknowledgedAt });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
