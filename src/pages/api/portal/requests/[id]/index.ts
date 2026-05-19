/**
 * PATCH /api/portal/requests/:id
 *
 * Client-side edit. Allowed only while status = 'new' (RLS enforces this).
 * Whitelist of editable fields here so we don't pass arbitrary data through.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const ALLOWED_CATEGORIES = new Set(['text', 'image', 'layout', 'new_feature', 'broken', 'other']);
const ALLOWED_PRIORITIES = new Set(['normal', 'important', 'urgent']);

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) return json({ error: 'Not signed in' }, 401);

  const id = params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  let body: Record<string, string>;
  try { body = await request.json(); } catch { return json({ error: 'Invalid body' }, 400); }

  const updates: Record<string, string | null> = {};
  if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
  if (typeof body.description === 'string' && body.description.trim()) updates.description = body.description.trim();
  if (typeof body.page_url === 'string') updates.page_url = body.page_url.trim() || null;
  if (typeof body.preferred_completion_date === 'string') {
    updates.preferred_completion_date = body.preferred_completion_date.trim() || null;
  }
  if (typeof body.category === 'string') {
    if (!ALLOWED_CATEGORIES.has(body.category)) return json({ error: 'Invalid category' }, 400);
    updates.category = body.category;
  }
  if (typeof body.priority === 'string') {
    if (!ALLOWED_PRIORITIES.has(body.priority)) return json({ error: 'Invalid priority' }, 400);
    updates.priority = body.priority;
  }
  if (Object.keys(updates).length === 0) return json({ error: 'Nothing to update' }, 400);

  const supabase = createServerSupabase({ cookies, request });
  const { error } = await supabase.from('requests').update(updates).eq('id', id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
