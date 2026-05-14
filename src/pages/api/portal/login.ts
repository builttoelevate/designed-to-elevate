/**
 * POST /api/portal/login  { email }
 *
 * Sends a Supabase magic link. Server-side so we control the redirect URL
 * and don't expose the anon client surface on the login page directly.
 *
 * Always responds 200 unless the email is malformed — we don't want to leak
 * whether an email is registered. (Magic links handle that gracefully:
 * a recipient with no account simply gets a sign-up link.)
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://designedtoelevate.co';
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!EMAIL_RX.test(email)) {
    return json({ error: 'Enter a valid email' }, 400);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: 'Auth is not configured' }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/portal/auth/callback`,
      // Allow magic link sign-up; first-time users (a new client owner) get
      // an account on first click.
      shouldCreateUser: true,
    },
  });

  if (error) {
    return json({ error: error.message }, 500);
  }
  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
