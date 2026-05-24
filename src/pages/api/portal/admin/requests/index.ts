/**
 * POST /api/portal/admin/requests   (application/json)
 *
 * Admin-only. Creates a job on behalf of a client — for when a client texts
 * or calls with something instead of submitting it through the portal. The
 * row is a normal request (shows up in the queue, runs the normal status
 * lifecycle) with `submitted_by` set to the admin's profile.
 *
 * Optional `instructions`: text the client must acknowledge. When present,
 * the client's request detail page surfaces it with a "Got it" button and
 * the admin can see when they acknowledged (see instructions_ack_at,
 * migration 0009).
 *
 * Files are NOT handled here — after creating the job, the admin uploads
 * completion screenshots through the existing
 * POST /api/portal/admin/requests/:id/files endpoint, same as for any
 * client-submitted request.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const ALLOWED_CATEGORIES = new Set(['text', 'image', 'layout', 'new_feature', 'broken', 'other']);
const ALLOWED_PRIORITIES = new Set(['normal', 'important', 'urgent']);

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  let body: {
    client_id?: string;
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    page_url?: string | null;
    instructions?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const clientId = (body.client_id ?? '').trim();
  const title = (body.title ?? '').trim();
  const description = (body.description ?? '').trim();
  const category = (body.category ?? '').trim();
  const priority = (body.priority ?? 'normal').trim();
  const pageUrl = (body.page_url ?? '')?.toString().trim() || null;
  const instructions = (body.instructions ?? '')?.toString().trim() || null;

  if (!clientId) return json({ error: 'client_id required' }, 400);
  if (!title || !description || !category) {
    return json({ error: 'Title, category, and description are required' }, 400);
  }
  if (!ALLOWED_CATEGORIES.has(category)) return json({ error: 'Invalid category' }, 400);
  if (!ALLOWED_PRIORITIES.has(priority)) return json({ error: 'Invalid priority' }, 400);

  const admin = createServiceSupabase();

  // Confirm the client exists before we create a job pointing at it.
  const { data: client } = await admin
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .maybeSingle();
  if (!client) return json({ error: 'Client not found' }, 404);

  const { data: created, error: insertErr } = await admin
    .from('requests')
    .insert({
      client_id: clientId,
      submitted_by: session.userId,
      title,
      description,
      category,
      priority,
      page_url: pageUrl,
      instructions,
    })
    .select('id')
    .single();

  if (insertErr || !created) {
    return json({ error: insertErr?.message || 'Could not create job' }, 500);
  }

  await admin.from('request_activity').insert({
    request_id: created.id,
    actor_id: session.userId,
    action: 'request_created',
    metadata: { title, logged_by_admin: true },
  });

  return json({ ok: true, id: created.id });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
