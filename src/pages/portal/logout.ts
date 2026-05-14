/**
 * /portal/logout
 *
 * Both POST (form submit from the layout's "Sign out" button) and GET
 * (direct visit, link clicks) clear the auth cookies and 303-redirect
 * to /portal/login.
 *
 * 303 is the spec-correct status for "form POST → follow as GET" — and
 * because the redirect is the server's response, no client JS is needed
 * for sign-out to work. If JS is broken or hasn't loaded yet, the
 * browser still does the right thing.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { clearAuthCookies } from '../../lib/supabase';

const handle: APIRoute = ({ cookies, redirect }) => {
  clearAuthCookies(cookies);
  return redirect('/portal/login', 303);
};

export const GET = handle;
export const POST = handle;
