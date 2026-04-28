import { defineConfig } from 'astro/config';

// Production deployment on Vercel at designedtoelevate.co
export default defineConfig({
  site: 'https://designedtoelevate.co',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
  compressHTML: true,
});
