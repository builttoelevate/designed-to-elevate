/**
 * POST /api/portal/admin/clients/:id/notifications   { key, enabled }
 *
 * Admin-only. Upserts one notification preference for one client into
 * public.client_notification_settings. Keys are validated against the
 * canonical list in src/lib/notifications.ts.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';
import { CLIENT_NOTIFICATIONS } from '../../../../../../lib/notifications';

const KNOWN_KEYS = new Set(CLIENT_NOTIFICATIONS.map((n) => n.key));

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const clientId = params.id;
  if (!clientId) return json({ error: 'Missing client id' }, 400);

  let body: { key?: string; enabled?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const key = String(body.key ?? '');
  if (!KNOWN_KEYS.has(key)) return json({ error: 'Unknown notification' }, 400);
  const enabled = body.enabled === true;

  const admin = createServiceSupabase();

  const { data: client } = await admin
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .maybeSingle();
  if (!client) return json({ error: 'Client not found' }, 404);

  const { error } = await admin
    .from('client_notification_settings')
    .upsert(
      {
        client_id: clientId,
        notification_key: key,
        enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id,notification_key' }
    );
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
