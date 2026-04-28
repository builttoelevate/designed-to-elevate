import { defineConfig } from 'astro/config';

// GitHub Pages deployment under builttoelevate/designed-to-elevate
export default defineConfig({
  site: 'https://builttoelevate.github.io',
  base: '/designed-to-elevate/',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
  compressHTML: true,
});
