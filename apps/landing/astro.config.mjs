// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://fortisuno.github.io/pinax',
  base: '/pinax',
  vite: {
    plugins: [tailwindcss()],
  },
});