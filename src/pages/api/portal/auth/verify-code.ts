/**
 * POST /api/portal/auth/verify-code  { email, code }
 *
 * Verifies a 6-digit code from a Supabase OTP email, sets HttpOnly session
 * cookies, and returns the post-login redirect path based on role.
 *
 * Server-side responsibilities:
 *   1. Validate shape (email format + exactly 6 digits) before hitting
 *      Supabase so obviously-bad requests never count against rate limits.
 *   2. supabase.auth.verifyOtp({ email, token: code, type: 'email' })
 *      → returns { session: { access_token, refresh_token, user } } on success
 *      → returns a typed error on bad/expired/exhausted codes, which we
 *        map to friendly copy for the UI.
 *   3. setAuthCookies writes the SSR auth cookies via the cookie adapter
 *      (HttpOnly, SameSite=Lax, Secure, 7-day max-age). The next request
 *      will be authenticated.
 *   4. Look up the role to decide /portal vs /portal/admin.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { setAuthCookies, createServiceSupabase } from '../../../../lib/supabase';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RX = /^\d{6}$/;

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const email = (body.email || '').trim().toLowerCase();
  const code = (body.code || '').replace(/\D/g, '');

  if (!EMAIL_RX.test(email)) {
    return json({ error: 'Enter a valid email' }, 400);
  }
  if (!CODE_RX.test(code)) {
    return json({ error: 'Enter the 6-digit code from your email' }, 400);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: 'Auth is not configured' }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });

  if (error || !data?.session) {
    const raw = (error?.message || '').toLowerCase();
    let friendly = "That code didn't work. Double-check the email or request a new code.";
    let status = 400;
    if (raw.includes('expired')) {
      friendly = 'That code has expired. Tap "Resend code" to get a new one.';
    } else if (raw.includes('invalid') || raw.includes('incorrect')) {
      friendly = "That code didn't match. Check the digits and try again.";
    } else if (raw.includes('rate') || raw.includes('too many')) {
      friendly = 'Too many attempts. Wait a minute, then request a new code.';
      status = 429;
    }
    return json({ error: friendly }, status);
  }

  const { access_token, refresh_token } = data.session;
  await setAuthCookies({ cookies, request }, access_token, refresh_token);

  // Pick the post-login destination. Service-role lookup is fine here — we
  // just verified the user.
  const admin = createServiceSupabase();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.session.user.id)
    .maybeSingle();
  const redirect = profile?.role === 'admin' ? '/portal/admin' : '/portal';

  return json({ ok: true, redirect });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
