import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function readAndroidGradleVersion() {
  try {
    const gradlePath = path.resolve(import.meta.dirname, 'android/app/build.gradle');
    const content = fs.readFileSync(gradlePath, 'utf-8');
    const nameMatch = content.match(/versionName\s+["']([^"']+)["']/);
    const codeMatch = content.match(/versionCode\s+(\d+)/);
    return {
      versionName: nameMatch?.[1]?.trim() || '1.2.2',
      versionCode: codeMatch?.[1] ? parseInt(codeMatch[1], 10) : 122,
    };
  } catch {
    return { versionName: '1.2.2', versionCode: 122 };
  }
}

export default defineConfig(() => {
  const gradleVersion = readAndroidGradleVersion();
  return {
    define: {
      __GRADLE_VERSION_NAME__: JSON.stringify(gradleVersion.versionName),
      __GRADLE_VERSION_CODE__: JSON.stringify(gradleVersion.versionCode),
    },
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'DigiPet: Virtual Digivice Companion',
          short_name: 'DigiPet',
          description: 'Authentic 1997 Bandai Digivice Virtual Pet with real Battle Spirit sprites, training, colosseum battles, and room habitat.',
          theme_color: '#992d24',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
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
