/**
 * Supabase clients.
 *
 * Two flavors:
 *   • createServerSupabase({ cookies, request }) — request-scoped, reads the
 *     user's session from cookies via @supabase/ssr. The SSR client auto-
 *     refreshes expired access tokens using the refresh token and writes the
 *     new pair back through the adapter, so call sites never deal with JWT
 *     expiry directly.
 *   • createServiceSupabase()       — bypasses RLS via the service role key.
 *     Use sparingly, only inside server code, only when admin operations need
 *     to write across tenants (e.g. inserting activity log rows, sending an
 *     email after a status change made by admin).
 *
 * The browser-side client is created on the page where it's needed (login,
 * file upload) so the anon key is the only secret that ever touches the
 * browser. The service role key MUST stay server-side.
 */

import { createServerClient, parseCookieHeader } from '@supabase/ssr';
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

// Cookie attributes the SSR adapter writes through. HttpOnly + Secure +
// SameSite=Lax blocks the portal cookies from being attached to cross-site
// POSTs (our CSRF defense), and 7 days matches Supabase's default refresh-
// token rotation window.
const COOKIE_DEFAULTS = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
};

export interface SupabaseRequestContext {
  cookies: AstroCookies;
  request: Request;
}

/**
 * Request-scoped Supabase client backed by @supabase/ssr. Cookies are read
 * from the incoming Request's `Cookie` header and written through Astro's
 * cookie API. The SSR client transparently refreshes expired access tokens
 * and the adapter writes the new pair back, so downstream code never sees
 * "JWT expired" as long as the refresh token is still valid.
 */
export function createServerSupabase(ctx: SupabaseRequestContext): SupabaseClient {
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        const header = ctx.request.headers.get('cookie') ?? '';
        return parseCookieHeader(header).map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          ctx.cookies.set(name, value, { ...COOKIE_DEFAULTS, ...(options ?? {}) });
        }
      },
    },
    cookieOptions: COOKIE_DEFAULTS,
  }) as unknown as SupabaseClient;
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

/**
 * Persist a fresh access/refresh pair from the magic-link callback. Calling
 * setSession on the SSR client routes through the cookie adapter, which
 * writes the SSR-format auth cookies.
 */
export async function setAuthCookies(
  ctx: SupabaseRequestContext,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const supabase = createServerSupabase(ctx);
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

/**
 * Sign the user out and clear cookies. signOut() triggers the SSR adapter to
 * write expired cookies, which the browser then drops.
 */
export async function clearAuthCookies(ctx: SupabaseRequestContext): Promise<void> {
  const supabase = createServerSupabase(ctx);
  await supabase.auth.signOut();
}

export const SUPABASE_PUBLIC_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};
