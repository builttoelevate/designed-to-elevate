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
  vite: {
    plugins: [tailwindcss()],
  },
});
