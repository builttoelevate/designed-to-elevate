/**
 * DELETE /api/portal/admin/client-users/:id
 *
 * Removes a user's link to a client business. Doesn't delete the auth user
 * record (they may belong to other clients in the future).
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  const admin = createServiceSupabase();
  const { error } = await admin.from('client_users').delete().eq('id', id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
