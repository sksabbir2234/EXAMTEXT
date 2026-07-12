import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
  redirects: {
    '/cse-exams': '/subject?id=cse-college-teacher',
  },
  headers: [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        { key: 'Content-Type', value: 'application/manifest+json' },
      ],
    },
    {
      source: '/manifest.webmanifest',
      headers: [
        { key: 'Content-Type', value: 'application/manifest+json' },
      ],
    },
  ],
});
