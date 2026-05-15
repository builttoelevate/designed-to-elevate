/**
 * POST /api/portal/admin/todos  { title }
 *
 * Admin-only. Creates a personal todo owned by the calling admin
 * (owner_id is set from the session — clients can't spoof it).
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const MAX_TITLE = 280;

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  let body: { title?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const title = (body.title ?? '').trim();
  if (!title) return json({ error: 'Title required' }, 400);
  if (title.length > MAX_TITLE) return json({ error: `Title too long (${MAX_TITLE} max)` }, 400);

  const admin = createServiceSupabase();
  const { data, error } = await admin
    .from('owner_todos')
    .insert({ owner_id: session.userId, title })
    .select('id, title, completed, created_at, completed_at')
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ todo: data });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
