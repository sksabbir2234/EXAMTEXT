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
});
