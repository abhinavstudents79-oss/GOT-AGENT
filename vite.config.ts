import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gotadmin-static-spa-routes',
        closeBundle() {
          try {
            const distDir = path.resolve(__dirname, 'dist');
            const indexHtml = path.join(distDir, 'index.html');
            if (!fs.existsSync(indexHtml)) return;

            // Create physical static route copies so /GOTadmin, /gotadmin, and 404 fallback work on Netlify & all static hosts
            const routeDirs = ['GOTadmin', 'gotadmin'];
            for (const dirName of routeDirs) {
              const targetDir = path.join(distDir, dirName);
              fs.mkdirSync(targetDir, { recursive: true });
              fs.copyFileSync(indexHtml, path.join(targetDir, 'index.html'));
            }
            fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
          } catch {
            // Ignore static copy errors
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
