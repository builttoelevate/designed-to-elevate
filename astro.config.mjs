import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Production deployment on Vercel at designedtoelevate.co
//
// Output mode: hybrid (static by default).
// Marketing pages prerender to static HTML at build time.
// Portal pages opt into SSR via `export const prerender = false;`
// so Supabase auth + per-user data work at request time.
export default defineConfig({
  site: 'https://designedtoelevate.co',
  trailingSlash: 'ignore',
  output: 'static',
  adapter: vercel(),
  build: {
    assets: 'assets',
  },
  compressHTML: true,
  // Legacy URL redirects after the redesign:
  //   /work    → /case-studies (the prior work page is replaced by case studies)
  //   /pricing → /custom-lead-systems (founding-5 pricing is gone with the new positioning)
  // /grow stays in place as the wizard ad landing page.
  redirects: {
    '/work': '/case-studies',
    '/pricing': '/custom-lead-systems',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
