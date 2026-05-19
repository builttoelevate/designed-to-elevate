/**
 * POST /api/portal/requests   (application/json)
 *
 * Creates the requests row + the request_created activity entry. Files are
 * uploaded direct from the browser to Supabase Storage via signed URLs in
 * /requests/:id/attachments/sign + /confirm — not multipart through here.
 *
 * Email timing: notification emails fire inline on every create. The "got it"
 * message just says the request is in the queue, which is true the moment
 * the row exists — independent of whether file 4 of 4 finished uploading.
 * Deferring emails to the last confirm tied them to the riskiest step in the
 * flow and made retry-after-partial-failure complicated; firing on create
 * sidesteps both problems.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerSupabase, createServiceSupabase } from '../../../../lib/supabase';
import { getPortalSession } from '../../../../lib/session';
import { sendNewRequestNotifications } from '../../../../lib/request-notifications';

const ALLOWED_CATEGORIES = new Set([
  'text',
  'image',
  'layout',
  'new_feature',
  'broken',
  'other',
]);
const ALLOWED_PRIORITIES = new Set(['normal', 'important', 'urgent']);

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) {
    return json({ error: 'Not signed in' }, 401);
  }
  if (session.clientIds.length === 0) {
    return json({ error: 'No client linked to this account' }, 403);
  }
  const clientId = session.clientIds[0];

  let body: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    page_url?: string | null;
    preferred_completion_date?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const title = (body.title ?? '').trim();
  const description = (body.description ?? '').trim();
  const category = (body.category ?? '').trim();
  const priority = (body.priority ?? 'normal').trim();
  const pageUrl = (body.page_url ?? '')?.toString().trim() || null;
  const completionDate = (body.preferred_completion_date ?? '')?.toString().trim() || null;

  if (!title || !description || !category) {
    return json({ error: 'Title, category, and description are required' }, 400);
  }
  if (!ALLOWED_CATEGORIES.has(category)) return json({ error: 'Invalid category' }, 400);
  if (!ALLOWED_PRIORITIES.has(priority)) return json({ error: 'Invalid priority' }, 400);

  const supabase = createServerSupabase({ cookies, request });

  // Confirm the server-side Supabase client is actually carrying the user's
  // session before we attempt the insert. If auth.uid() is null here, the
  // cookie didn't propagate — log it so we can see in function logs.
  const { data: whoami, error: whoErr } = await supabase.auth.getUser();
  if (whoErr || !whoami?.user) {
    console.error('[requests] supabase.auth.getUser failed', {
      sessionUserId: session.userId,
      err: whoErr?.message,
    });
    return json({ error: 'Session expired — please sign out and back in' }, 401);
  }

  const insertPayload = {
    client_id: clientId,
    submitted_by: session.userId,
    title,
    description,
    category,
    priority,
    page_url: pageUrl,
    preferred_completion_date: completionDate,
  };

  const { data: created, error: insertErr } = await supabase
    .from('requests')
    .insert(insertPayload)
    .select('id, title')
    .single();

  if (insertErr || !created) {
    console.error('[requests] insert failed', {
      authUid: whoami.user.id,
      payload: insertPayload,
      err: insertErr,
    });
    return json({ error: insertErr?.message || 'Could not create request' }, 500);
  }

  const admin = createServiceSupabase();
  await admin.from('request_activity').insert({
    request_id: created.id,
    actor_id: session.userId,
    action: 'request_created',
    metadata: { title: created.title },
  });

  // Fire emails for every request, regardless of file count. See file header
  // for the rationale.
  void sendNewRequestNotifications(created.id, clientId, created.title, {
    category,
    priority,
    description,
  });

  return json({ ok: true, id: created.id });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
