/**
 * Route protection for the Client Hub.
 *
 *   Unauth on /portal/*           → /portal/login
 *   Auth client on /portal/admin/*→ /portal
 *   Auth admin on /portal (root)  → /portal/admin  (after login redirect)
 *
 * Pass-through for everything outside /portal/*. The marketing site is static
 * and this middleware should not touch it.
 *
 * Also sets Cache-Control: no-store on every portal HTML response so that
 * after sign-out, hitting the browser back button doesn't show a cached
 * authenticated page. (API JSON responses don't go through here — they're
 * already non-cacheable.)
 */

import { defineMiddleware } from 'astro:middleware';
import { getPortalSession } from './lib/session';

const PUBLIC_PORTAL_PATHS = new Set([
  '/portal/login',
  '/portal/auth/callback',
  '/portal/logout',
]);

function noStore(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (!pathname.startsWith('/portal')) {
    return next();
  }

  // Public portal routes — pass through, but make session available if present.
  if (PUBLIC_PORTAL_PATHS.has(pathname)) {
    context.locals.session = await getPortalSession(context.cookies);
    return noStore(await next());
  }

  const session = await getPortalSession(context.cookies);
  context.locals.session = session;

  if (!session) {
    return noStore(context.redirect('/portal/login'));
  }

  if (pathname.startsWith('/portal/admin') && session.role !== 'admin') {
    return noStore(context.redirect('/portal'));
  }

  return noStore(await next());
});
