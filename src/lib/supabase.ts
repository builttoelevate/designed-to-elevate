/**
 * Supabase clients.
 *
 * Two flavors:
 *   • createServerSupabase(cookies) — request-scoped, reads the user's session
 *     from cookies. Use inside .astro frontmatter and API routes when you want
 *     RLS to enforce per-user access.
 *   • createServiceSupabase()       — bypasses RLS via the service role key.
 *     Use sparingly, only inside server code, only when admin operations need
 *     to write across tenants (e.g. inserting activity log rows, sending an
 *     email after a status change made by admin).
 *
 * The browser-side client is created on the page where it's needed (login,
 * file upload) so the anon key is the only secret that ever touches the
 * browser. The service role key MUST stay server-side.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // We don't throw at module load — the marketing site builds without these
  // env vars set. Portal routes will throw at request time, which is correct.
  console.warn(
    '[supabase] PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY missing. ' +
      'The /portal/* routes will not function until these are set.'
  );
}

const ACCESS_COOKIE = 'sb-access-token';
const REFRESH_COOKIE = 'sb-refresh-token';

const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  // 7 days; matches Supabase default session length.
  maxAge: 60 * 60 * 24 * 7,
};

/**
 * Request-scoped Supabase client. Reads the user's access token from the
 * sb-access-token cookie and tells Supabase to use it via the Authorization
 * header on every request, so all queries run against the user's session
 * and are filtered by RLS.
 */
export function createServerSupabase(cookies: AstroCookies): SupabaseClient {
  const accessToken = cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookies.get(REFRESH_COOKIE)?.value;

  const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {},
  });

  if (accessToken && refreshToken) {
    // setSession is async but the in-memory state update is synchronous enough
    // for the request lifetime; we don't await here because most call sites
    // just need the Authorization header set above.
    void client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return client;
}

/**
 * Service-role Supabase client — bypasses RLS. Use only on the server, only
 * for admin operations like activity-log inserts and admin status writes.
 */
export function createServiceSupabase(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function setAuthCookies(
  cookies: AstroCookies,
  accessToken: string,
  refreshToken: string
) {
  cookies.set(ACCESS_COOKIE, accessToken, cookieOptions);
  cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions);
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete(ACCESS_COOKIE, { path: '/' });
  cookies.delete(REFRESH_COOKIE, { path: '/' });
}

export const SUPABASE_PUBLIC_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};
