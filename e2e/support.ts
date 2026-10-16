import { expect, test, type APIRequestContext, type Page, type Route } from '@playwright/test';

// The store's content changes whenever the admin edits it, so nothing here hard-codes products,
// counts or text from the database: the live tests compare the page with what the API returned.

const trim = (url: string) => url.replace(/\/+$/, '');

/** Where the backends are. Defaults are the local compose stack (only used without BASE_URL). */
export const env = {
  baseUrl: process.env.BASE_URL ? trim(process.env.BASE_URL) : '',
  apiUrl: trim(process.env.API_URL || (process.env.BASE_URL ? '' : 'http://localhost:8080')),
  authUrl: trim(process.env.AUTH_URL || (process.env.BASE_URL ? '' : 'http://localhost:5001')),
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin',
};

export const LANG_KEY = 'prket-alandlos-admin-lang';
export const TOKEN_KEY = 'admin_token';

/** A 1×1 PNG the backend can decode and thumbnail */
export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/** Edit the site in English so the tests can use one set of labels. */
export async function editInEnglish(page: Page) {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, 'en');
  }, LANG_KEY);
}

/** Signs in through the login form and waits for the editable site. */
export async function login(page: Page, username = env.username, password = env.password) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
}

/** Clicks a click-to-edit field, replaces its text and commits it (blur). */
export async function editField(page: Page, label: string, text: string) {
  const field = page.getByRole('textbox', { name: label, exact: true });
  await field.click();
  await field.press('ControlOrMeta+a');
  await field.pressSequentially(text);
  await field.blur();
  return field;
}

// ---------------------------------------------------------------------------------------------
// Live backend
// ---------------------------------------------------------------------------------------------

let reachable: Promise<string | null> | undefined;

/**
 * Skips the calling test unless the API and auth Worker answer. Probes once per worker:
 * GET /api/info, and a login with a wrong password (any JSON answer means the Worker is up).
 */
export async function requireLiveBackend(request: APIRequestContext) {
  reachable ??= (async () => {
    if (!env.apiUrl || !env.authUrl) return 'set API_URL and AUTH_URL to test a deployed BASE_URL';
    try {
      const info = await request.get(`${env.apiUrl}/api/info?lang=en`, { timeout: 10_000 });
      if (!info.ok()) return `API ${env.apiUrl} answered HTTP ${info.status()}`;
      const auth = await request.post(`${env.authUrl}/auth/login`, {
        data: { username: '', password: '' },
        timeout: 10_000,
      });
      await auth.json();
      return null;
    } catch (err) {
      return `backend unreachable (${env.apiUrl}, ${env.authUrl}): ${(err as Error).message.split('\n')[0]}`;
    }
  })();
  const reason = await reachable;
  test.skip(reason !== null, reason ?? '');
}

/** An admin token from the real auth Worker, for cleanup through the API */
export async function apiToken(request: APIRequestContext) {
  const res = await request.post(`${env.authUrl}/auth/login`, {
    data: { username: env.username, password: env.password },
  });
  const body = await res.json();
  expect(body.success, `login as ${env.username} failed: ${body.message}`).toBe(true);
  return body.token as string;
}

export interface ApiProduct {
  id: string;
  title?: string;
  price?: number;
}

export async function listProducts(request: APIRequestContext): Promise<ApiProduct[]> {
  const res = await request.get(`${env.apiUrl}/api/products`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  expect(res.ok()).toBe(true);
  return (await res.json()).data ?? [];
}

// ---------------------------------------------------------------------------------------------
// Mocked backend (route interception): nothing reaches a real server
// ---------------------------------------------------------------------------------------------

export interface MockOptions {
  /** GET /api/info: data, or an HTTP status to fail with */
  info?: Record<string, unknown> | number;
  /** GET /api/products: list, or an HTTP status to fail with */
  products?: unknown[] | number;
  validTokens?: string[];
  /** Answer every write (POST/PUT/DELETE under /api/) with this HTTP status instead of 200 */
  failWrites?: number;
}

export const MOCK_USER = { username: 'e2e-admin', password: 'e2e-password' };
export const MOCK_TOKEN = 'e2e-mock-token';

export const MOCK_INFO = {
  showPrice: true,
  storeOpeningTime: 'Sunday — Thursday 9:00 AM — 7:00 PM',
  email: 'store@example.test',
  phone: '000',
  whatsappLink: 'wa.me/000',
  location: 'Somewhere',
  heroTitle: 'Mock hero title',
};

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

/**
 * Serves the auth Worker and the API from inside the browser, whatever host the build points
 * at. Returns the intercepted write requests for assertions.
 */
export async function mockBackend(page: Page, opts: MockOptions = {}) {
  const { info = MOCK_INFO, products = [], validTokens = [MOCK_TOKEN], failWrites } = opts;
  const writes: { method: string; path: string; body: string | null }[] = [];

  await page.route(
    (url) => url.pathname.startsWith('/auth/'),
    async (route) => {
      const req = route.request();
      const path = new URL(req.url()).pathname;
      if (path === '/auth/login') {
        const { username, password } = req.postDataJSON() ?? {};
        return username === MOCK_USER.username && password === MOCK_USER.password
          ? json(route, 200, { success: true, token: MOCK_TOKEN })
          : json(route, 401, { success: false, message: 'Invalid credentials' });
      }
      if (path === '/auth/validate') {
        const token = (req.headers()['authorization'] || '').replace(/^Bearer /, '');
        return validTokens.includes(token)
          ? json(route, 200, { success: true })
          : json(route, 401, { success: false, message: 'Invalid token' });
      }
      return json(route, 404, { success: false });
    },
  );

  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const req = route.request();
      const method = req.method();
      const path = new URL(req.url()).pathname;
      if (method !== 'GET') {
        writes.push({ method, path, body: req.postData() });
        return failWrites
          ? json(route, failWrites, { success: false, error: `Mocked HTTP ${failWrites}` })
          : json(route, 200, { success: true, data: { id: 'mock-id' } });
      }
      if (path === '/api/info') {
        return typeof info === 'number'
          ? json(route, info, { success: false, error: `Mocked HTTP ${info}` })
          : json(route, 200, { success: true, data: info });
      }
      if (path === '/api/products') {
        return typeof products === 'number'
          ? json(route, products, { success: false, error: `Mocked HTTP ${products}` })
          : json(route, 200, { success: true, data: products });
      }
      // Logo, hero image and product photos
      return route.fulfill({ status: 200, contentType: 'image/png', body: TINY_PNG });
    },
  );

  return { writes };
}
