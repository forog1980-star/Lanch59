import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isElectron = process.env.ELECTRON_BUILD === 'true';
  let resolvedOutDir = path.resolve(__dirname, 'dist');

  return {
    base: isElectron ? './' : '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        configResolved(config) {
          resolvedOutDir = path.resolve(config.root, config.build.outDir);
        },
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(resolvedOutDir, 'src/assets');
          if (fs.existsSync(resolvedOutDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
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
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
