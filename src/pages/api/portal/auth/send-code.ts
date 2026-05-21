/**
 * POST /api/portal/auth/send-code  { email }
 *
 * Sends the Client Hub owner a 6-digit login code via Supabase Auth OTP.
 * Replaces the prior magic-link flow at /api/portal/login. Codes work
 * inside email-app in-app browsers (Gmail/Mail), which is where magic
 * links commonly broke (separate cookie jar from Safari/Chrome).
 *
 * Implementation notes:
 *   - We omit `emailRedirectTo` so Supabase renders the Token instead of
 *     building a clickable confirmation URL. The same "Magic Link" email
 *     template is used — Supabase just substitutes a 6-digit token into
 *     `{{ .Token }}` rather than emitting `{{ .ConfirmationURL }}`.
 *   - `shouldCreateUser: true` matches the prior behavior so a first-time
 *     owner can sign in without an admin-side invite.
 *   - We don't leak whether an email is registered: we return ok for any
 *     well-formed email Supabase accepts.
 *
 * TODO (one-time Supabase Dashboard step, not code):
 *   Auth → Email Templates → Magic Link
 *     Make `{{ .Token }}` the visual headline — large, monospace, easy
 *     to read on a phone. Keep `{{ .ConfirmationURL }}` lower in the
 *     email as a fallback for the admin-invite flow (which still relies
 *     on links via /portal/auth/callback).
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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
    options: { shouldCreateUser: true },
  });

  if (error) {
    // Supabase rate-limits OTP sends per email (default 60s). Surface that
    // so the UI can drive a clear cooldown message.
    const msg = error.message || 'Could not send code';
    const rateLimited = /rate|429|too many/i.test(msg);
    return json({ error: msg }, rateLimited ? 429 : 500);
  }

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
