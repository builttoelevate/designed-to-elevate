/**
 * Route protection for the Client Hub.
 *
 *   Unauth on /portal/*           → /portal/login
 *   Auth client on /portal/admin/*→ /portal
 *   Auth admin on /portal (root)  → /portal/admin  (after login redirect)
 *
 * Pass-through for everything outside /portal/*. The marketing site is static
 * and this middleware should not touch it.
 */

import { defineMiddleware } from 'astro:middleware';
import { getPortalSession } from './lib/session';

const PUBLIC_PORTAL_PATHS = new Set([
  '/portal/login',
  '/portal/auth/callback',
  '/portal/logout',
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (!pathname.startsWith('/portal')) {
    return next();
  }

  // Public portal routes — pass through, but make session available if present.
  if (PUBLIC_PORTAL_PATHS.has(pathname)) {
    context.locals.session = await getPortalSession(context.cookies);
    return next();
  }

  const session = await getPortalSession(context.cookies);
  context.locals.session = session;

  if (!session) {
    return context.redirect('/portal/login');
  }

  if (pathname.startsWith('/portal/admin') && session.role !== 'admin') {
    return context.redirect('/portal');
  }

  return next();
});
