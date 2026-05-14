/**
 * POST /api/portal/admin/clients
 *
 * Admin-only. Creates a new client business record.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const SLUG_RX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const business_name = (body.business_name || '').trim();
  const slug = (body.slug || '').trim().toLowerCase();
  const primary_contact_email = (body.primary_contact_email || '').trim().toLowerCase();
  const site_url = (body.site_url || '').trim() || null;

  if (!business_name || !slug || !primary_contact_email) {
    return json({ error: 'Business name, slug, and email are required' }, 400);
  }
  if (!SLUG_RX.test(slug)) return json({ error: 'Slug must be lowercase letters, numbers, and hyphens' }, 400);

  const admin = createServiceSupabase();
  const { data, error } = await admin
    .from('clients')
    .insert({ business_name, slug, primary_contact_email, site_url })
    .select('slug')
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, slug: data.slug });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
