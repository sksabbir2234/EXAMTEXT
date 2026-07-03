import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
  vite: {
    ssr: {
      noExternal: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/firestore'],
    },
  },
});
