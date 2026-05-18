import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// Production deployment on Cloudflare Pages at designedtoelevate.co
//
// Output mode: hybrid (static by default).
// Marketing pages prerender to static HTML at build time.
// Portal pages opt into SSR via `export const prerender = false;`
// so Supabase auth + per-user data work at request time.
//
// We moved off Vercel in May 2026 because Vercel's ~4.5 MB serverless
// request-body cap blocked client photo uploads (HTTP 413). Cloudflare
// Pages allows up to 100 MB per request, which fits modern phone photos
// comfortably.
export default defineConfig({
  site: 'https://designedtoelevate.co',
  trailingSlash: 'ignore',
  output: 'static',
  adapter: cloudflare(),
  build: {
    assets: 'assets',
  },
  compressHTML: true,
  // Legacy URL redirects after the redesign:
  //   /work                 → /case-studies (the prior work page is replaced)
  //   /pricing              → /custom-lead-systems (founding-5 pricing is gone)
  //   /contractor-websites  → /web-design (legacy URL kept indexed)
  // /grow stays in place as the wizard ad landing page.
  redirects: {
    '/work': '/case-studies',
    '/pricing': '/custom-lead-systems',
    '/contractor-websites': {
      status: 301,
      destination: '/web-design',
    },
  },
  // Astro 5's default `security.checkOrigin` rejects POSTs with a form
  // content-type (multipart/form-data, x-www-form-urlencoded, text/plain)
  // when the Origin header doesn't exactly match the host. Cloudflare's
  // edge can normalize Origin headers on internal requests, which makes
  // the check fire on legitimate requests (the portal's file-upload flow,
  // the sign-out form, etc.).
  //
  // CSRF protection for the portal already comes from cookie attributes:
  // sb-access-token / sb-refresh-token are HttpOnly + Secure + SameSite=Lax,
  // so the browser will not attach them to a cross-site POST. Every portal
  // endpoint then validates the session before touching data, so a CSRF
  // attempt without the cookie hits 401 anyway.
  security: {
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
