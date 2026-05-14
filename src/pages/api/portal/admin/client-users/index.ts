/**
 * POST /api/portal/admin/client-users  { email, client_id, role }
 *
 * Admin-only. Invites a user by email:
 *   1. Find or create the auth.users record (Supabase admin API).
 *   2. Ensure a profiles row exists (the on-signup trigger normally handles it).
 *   3. Link the user to the client via client_users.
 *   4. Send a magic-link sign-in email.
 *
 * Idempotent: if the user is already linked, return ok.
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

  // Find or create the auth user.
  let userId: string | undefined;
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
  const match = existing?.users.find((u) => u.email?.toLowerCase() === email);
  if (match) userId = match.id;

  if (!userId) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createErr || !created?.user) return json({ error: createErr?.message || 'Could not create user' }, 500);
    userId = created.user.id;
  }

  // Make sure the profile row exists (the auth.users trigger usually handles
  // this, but if for any reason it didn't, insert one defensively).
  await admin.from('profiles').upsert({ id: userId }, { onConflict: 'id' });

  // Link to client (idempotent).
  const { error: linkErr } = await admin
    .from('client_users')
    .upsert({ user_id: userId, client_id, role }, { onConflict: 'user_id,client_id' });
  if (linkErr) return json({ error: linkErr.message }, 500);

  // Send a magic link so they can sign in immediately.
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    await anon.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/portal/auth/callback`,
        shouldCreateUser: false,
      },
    });
  }

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
