/**
 * PATCH  /api/portal/admin/todos/:id  { completed }
 * DELETE /api/portal/admin/todos/:id
 *
 * Admin-only. Operates only on rows owned by the calling admin —
 * filters by owner_id even though the service-role client bypasses RLS,
 * so a malicious admin couldn't tamper with a future second admin's rows.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  let body: { completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  if (typeof body.completed !== 'boolean') {
    return json({ error: 'completed must be boolean' }, 400);
  }

  const admin = createServiceSupabase();
  const { data, error } = await admin
    .from('owner_todos')
    .update({ completed: body.completed })
    .eq('id', id)
    .eq('owner_id', session.userId)
    .select('id, title, completed, created_at, completed_at')
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: 'Not found' }, 404);
  return json({ todo: data });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  const admin = createServiceSupabase();
  const { error, count } = await admin
    .from('owner_todos')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('owner_id', session.userId);

  if (error) return json({ error: error.message }, 500);
  if (!count) return json({ error: 'Not found' }, 404);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
