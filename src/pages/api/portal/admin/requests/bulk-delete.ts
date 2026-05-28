/**
 * POST /api/portal/admin/requests/bulk-delete  { ids: string[] }
 *
 * Admin-only. Hard-deletes the given requests. FK constraints on
 * request_files, comments, and request_activity cascade, so child rows
 * are removed automatically when the parent goes away.
 *
 * Storage cleanup is not handled here — request file objects in the
 * storage bucket are left as orphans on delete. The DB rows are gone so
 * nothing references them; a separate sweep job can reclaim the bytes.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const MAX_BULK = 200;

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const rawIds = Array.isArray(body.ids) ? body.ids : [];
  const ids = Array.from(new Set(rawIds.filter((v): v is string => typeof v === 'string' && v.length > 0)));
  if (ids.length === 0) return json({ error: 'No ids' }, 400);
  if (ids.length > MAX_BULK) return json({ error: `Too many ids (max ${MAX_BULK})` }, 400);

  const admin = createServiceSupabase();
  const { error, count } = await admin.from('requests').delete({ count: 'exact' }).in('id', ids);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, deleted: count ?? 0 });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
