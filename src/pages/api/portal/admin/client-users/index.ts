/**
 * POST /api/portal/admin/client-users  { email, client_id, role }
 *
 * Admin-only. Adds a user to a client.
 *
 * Strategy: try to invite first, fall back to magic link only if Supabase
 * tells us the user already exists.
 *
 * Why not pre-check with listUsers? Two problems:
 *   1. listUsers paginates — at the default page size it can silently miss
 *      a user further down the list, then we'd try to invite them and 422.
 *   2. Any prior flow that ever created the auth.users row (an earlier
 *      test, a magic-link sign-in attempt with shouldCreateUser:true,
 *      etc.) would make the user "exist" even though they've never been
 *      invited or onboarded. We'd send them the wrong template.
 *
 * inviteUserByEmail is the source of truth: it either succeeds (the user
 * was truly new and Supabase fired the "Invite user" template) or it
 * errors with a "user already exists" message (we fall back to magic link).
 *
 * In both cases we then upsert the profile + link the user to the client
 * via client_users, so they're scoped correctly the moment they sign in.
 *
 * Service role for everything that touches auth.users or writes across
 * tenants. Never expose the service role key client-side.
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
  const session = await getPortalSession({ cookies, request });
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

  // 1) Try invite first — let Supabase tell us if the user is new or not.
  const { data: invited, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(email, { redirectTo });

  let userId: string | undefined;
  let emailKind: 'invite' | 'magic_link';

  if (invited?.user) {
    // Brand-new user. Supabase already sent the "Invite user" template.
    userId = invited.user.id;
    emailKind = 'invite';
    console.log('[invite] inviteUserByEmail OK — Supabase "Invite user" template fired', {
      email,
      userId,
    });
  } else if (inviteErr && isAlreadyExistsError(inviteErr)) {
    // 2) User already exists in auth. Look them up so we can link them,
    //    then send a magic link below instead of an invite.
    console.log('[invite] inviteUserByEmail says user exists — falling back to magic link', {
      email,
      status: inviteErr?.status,
      message: inviteErr?.message,
    });
    const found = await findUserIdByEmail(admin, email);
    if (!found) {
      console.error('[invite] user exists in auth but lookup failed', { email });
      return json({ error: 'User exists but could not be found' }, 500);
    }
    userId = found;
    emailKind = 'magic_link';
  } else {
    console.error('[invite] inviteUserByEmail failed', {
      email,
      status: inviteErr?.status,
      message: inviteErr?.message,
    });
    return json({ error: inviteErr?.message || 'Could not invite user' }, 500);
  }

  // Defensive profile upsert. The on_auth_user_created trigger normally
  // handles this, but doing it here is idempotent and protects against any
  // rare cases where the trigger didn't run.
  await admin.from('profiles').upsert({ id: userId }, { onConflict: 'id' });

  // Link to client (idempotent).
  const { error: linkErr } = await admin
    .from('client_users')
    .upsert({ user_id: userId, client_id, role }, { onConflict: 'user_id,client_id' });
  if (linkErr) return json({ error: linkErr.message }, 500);

  // Existing users still need a sign-in link. New invitees already got
  // their email from inviteUserByEmail above.
  if (emailKind === 'magic_link' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { error: otpErr } = await anon.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });
    console.log('[invite] signInWithOtp called — Supabase "Magic Link" template fired', {
      email,
      otpError: otpErr?.message,
    });
  }

  return json({ ok: true, emailKind, email });
};

/**
 * Supabase signals "user already exists" via a 422 (or sometimes 400) with
 * a message like "A user with this email address has already been registered".
 * Check both status and message to be robust across versions.
 */
function isAlreadyExistsError(err: { status?: number; message?: string }): boolean {
  if (err.status === 422) return true;
  const msg = (err.message || '').toLowerCase();
  return /already|exists|registered|duplicate/.test(msg);
}

/**
 * Walk Supabase's listUsers pages until we find the user by email. Paginated
 * so we don't miss a user past the first 200 if the project ever grows.
 */
async function findUserIdByEmail(
  admin: ReturnType<typeof createServiceSupabase>,
  email: string
): Promise<string | undefined> {
  const target = email.toLowerCase();
  const perPage = 200;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('[invite] listUsers failed during lookup', error);
      return undefined;
    }
    const users = data?.users ?? [];
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (users.length < perPage) return undefined; // no more pages
  }
  return undefined;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
