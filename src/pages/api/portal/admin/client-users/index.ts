/**
 * POST /api/portal/admin/client-users  { email, client_id, role }
 *
 * Admin-only. Adds a user to a client.
 *
 * Flow:
 *   1. If the email doesn't exist in auth.users yet → call
 *      supabase.auth.admin.inviteUserByEmail(). Supabase creates the auth
 *      user AND sends the "Invite user" template (configured branded HTML
 *      in the Supabase dashboard) with a confirmation link that lands at
 *      /portal/auth/callback after acceptance.
 *
 *   2. If the email already exists → send a magic link via signInWithOtp.
 *      They've already gone through some onboarding, so the "Magic Link"
 *      template is the right one.
 *
 *   3. In both cases, ensure a profiles row exists and link the user to
 *      the client via client_users (idempotent upsert) so they're scoped
 *      correctly the moment they sign in.
 *
 * Service role is used for everything that touches auth.users or writes
 * across tenants. Never expose the service role key client-side.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://designedtoelevate.co';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(['owner', 'member']);

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  let body: { email?: string; client_id?: string; role?: string };
  try { body = await request.json(); } catch { return json({ error: 'Invalid body' }, 400); }

  const email = (body.email || '').trim().toLowerCase();
  const client_id = (body.client_id || '').trim();
  const role = body.role && ALLOWED_ROLES.has(body.role) ? body.role : 'member';

  if (!EMAIL_RX.test(email)) return json({ error: 'Enter a valid email' }, 400);
  if (!client_id) return json({ error: 'Missing client_id' }, 400);

  const admin = createServiceSupabase();
  const redirectTo = `${SITE_URL}/portal/auth/callback`;

  // Is this a brand-new portal user?
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
  const match = existing?.users.find((u) => u.email?.toLowerCase() === email);

  let userId: string | undefined = match?.id;
  let emailKind: 'invite' | 'magic_link' = 'invite';

  if (!userId) {
    // New user → fire the "Invite user" template (branded HTML in Supabase).
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo }
    );
    if (inviteErr || !invited?.user) {
      return json({ error: inviteErr?.message || 'Could not invite user' }, 500);
    }
    userId = invited.user.id;
  } else {
    // Existing user — they've signed in before. Send a magic link, not an invite.
    emailKind = 'magic_link';
  }

  // Defensive profile upsert. The on_auth_user_created trigger normally
  // handles this, but doing it here is idempotent and protects against
  // any rare cases where the trigger didn't run.
  await admin.from('profiles').upsert({ id: userId }, { onConflict: 'id' });

  // Link to client (idempotent).
  const { error: linkErr } = await admin
    .from('client_users')
    .upsert({ user_id: userId, client_id, role }, { onConflict: 'user_id,client_id' });
  if (linkErr) return json({ error: linkErr.message }, 500);

  // For existing users we still need to send them a sign-in link. New
  // invites already got their email from inviteUserByEmail above.
  if (emailKind === 'magic_link' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    await anon.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });
  }

  return json({ ok: true, emailKind });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
