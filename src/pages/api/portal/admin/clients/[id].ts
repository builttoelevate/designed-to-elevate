/**
 * PATCH /api/portal/admin/clients/:id
 *
 * Admin-only. Update business name, contact, site URL, status.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const ALLOWED_STATUS = new Set(['active', 'paused', 'archived']);

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const updates: Record<string, string | null> = {};
  if (typeof body.business_name === 'string' && body.business_name.trim()) {
    updates.business_name = body.business_name.trim();
  }
  if (typeof body.primary_contact_email === 'string' && body.primary_contact_email.trim()) {
    updates.primary_contact_email = body.primary_contact_email.trim().toLowerCase();
  }
  if (typeof body.site_url === 'string') {
    updates.site_url = body.site_url.trim() || null;
  }
  if (typeof body.status === 'string') {
    if (!ALLOWED_STATUS.has(body.status)) return json({ error: 'Invalid status' }, 400);
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) return json({ error: 'Nothing to update' }, 400);

  const admin = createServiceSupabase();
  const { error } = await admin.from('clients').update(updates).eq('id', id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
