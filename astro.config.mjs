import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Production deployment on Vercel at designedtoelevate.co
export default defineConfig({
  site: 'https://designedtoelevate.co',
  trailingSlash: 'ignore',
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
