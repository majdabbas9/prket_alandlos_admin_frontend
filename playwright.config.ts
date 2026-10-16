import { defineConfig, devices } from '@playwright/test';

// End-to-end tests (e2e/).
//   e2e/mocked - every backend call is intercepted in the browser; runs anywhere, writes nothing
//   e2e/live   - the real auth Worker and API; skipped when they can't be reached. Writes are
//                limited to an e2e-<timestamp> product that the test deletes again.
//
//   BASE_URL set   - test that site; give API_URL and AUTH_URL for the live tests
//   BASE_URL unset - build and preview this checkout on :4176 against API_URL / AUTH_URL
//                    (default http://localhost:8080 and :5001, the local compose stack)
//   ADMIN_USERNAME / ADMIN_PASSWORD - live login (default admin / admin)
const baseURL = process.env.BASE_URL?.replace(/\/+$/, '');
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 }, // the API container may be cold-starting
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: baseURL || 'http://localhost:4176',
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'mocked', testDir: './e2e/mocked', use: { ...devices['Desktop Chrome'] } },
    { name: 'live', testDir: './e2e/live', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: baseURL
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --strictPort',
        url: 'http://localhost:4176',
        reuseExistingServer: !CI,
        timeout: 180_000,
        env: {
          VITE_SERVER_URL: process.env.API_URL || 'http://localhost:8080',
          VITE_ADMIN_BACKEND_URL: process.env.AUTH_URL || 'http://localhost:5001',
        },
      },
});
