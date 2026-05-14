/**
 * POST /api/portal/auth/session { access_token, refresh_token }
 *
 * Called from /portal/auth/callback once the browser has parsed the hash
 * fragment. We:
 *   1. validate the token by asking Supabase who it represents,
 *   2. set HttpOnly cookies so the rest of the app can use them,
 *   3. return the post-login redirect path based on role.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { setAuthCookies, createServiceSupabase } from '../../../../lib/supabase';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { access_token?: string; refresh_token?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const { access_token, refresh_token } = body;
  if (!access_token || !refresh_token) {
    return json({ error: 'Missing tokens' }, 400);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: 'Auth is not configured' }, 500);
  }

  // Confirm the token is valid before trusting it.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${access_token}` } },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return json({ error: 'Invalid session' }, 401);
  }

  setAuthCookies(cookies, access_token, refresh_token);

  // Look up the role so we can send admins straight to the admin dashboard.
  const admin = createServiceSupabase();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
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
