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

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession(cookies);
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

  const supabase = createServerSupabase(cookies);
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

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
