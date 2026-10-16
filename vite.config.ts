/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5176,
  },
  preview: {
    port: 4176,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Unit/component tests (npm test). The Playwright e2e suite lives in e2e/ and runs separately.
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Built URLs must not depend on the developer's .env
    env: { VITE_SERVER_URL: 'http://api.test', VITE_ADMIN_BACKEND_URL: 'http://auth.test' },
  },
});
