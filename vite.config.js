import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { seoPlugin } from './seo/build.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react(), tailwindcss(), seoPlugin(env.VITE_SITE_URL || undefined)],
    server: {
      headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
    },
  };
});
