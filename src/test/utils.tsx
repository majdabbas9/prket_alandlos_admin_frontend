import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '@/App';
import { LanguageProvider, STORAGE_KEY as LANG_KEY } from '@/i18n/LanguageProvider';
import type { StoreInfo } from '@/hooks/useInfo';
import type { Lang } from '@/i18n/translations';

// Base URLs baked in by vite.config.ts (test.env)
export const API = 'http://api.test';
export const AUTH = 'http://auth.test';

export const VALID_USER = { username: 'admin', password: 'correct-horse' };
export const VALID_TOKEN = 'valid-token';

export const STORE_INFO: StoreInfo = {
  lang: 'en',
  showPrice: true,
  storeOpeningTime: 'Sunday — Thursday 9:00 AM — 7:00 PM',
  email: 'info@store.test',
  phone: '04-6000000',
  whatsappLink: 'wa.me/+972500000000',
  location: 'Main Street',
  heroTitle: 'Saved hero title',
};

export const PRODUCTS = [
  { id: 'p1', title: 'Fixture Oak', price: 95, imageKey: 'products/a.jpg' },
  { id: 'p2', title: 'Fixture Walnut', price: 140, imageUrl: 'https://img.test/b.jpg' },
];

export type Reply = { status?: number; body: unknown } | 'network-error';

export interface Call {
  method: string;
  url: URL;
  /** Parsed JSON body, or the FormData as sent */
  body: unknown;
  headers: Headers;
}

export interface FakeBackendOptions {
  info?: StoreInfo | Reply;
  products?: unknown[] | Reply;
  /** Overrides any route; return undefined to fall through to the default fake */
  override?: (call: Call) => Reply | undefined;
}

const toResponse = (r: Reply) =>
  r === 'network-error'
    ? Promise.reject(new TypeError('Failed to fetch'))
    : Promise.resolve(
        new Response(JSON.stringify(r.body), {
          status: r.status ?? 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

const isReply = (v: unknown): v is Reply =>
  v === 'network-error' || (typeof v === 'object' && v !== null && 'body' in v);

/**
 * Stubs fetch with a fake auth Worker and API: login/validate, store info, products CRUD and
 * image uploads. Writes succeed and echo what was sent. Unknown URLs fail like a dead server.
 * Returns the recorded calls.
 */
export function fakeBackend({
  info = STORE_INFO,
  products = PRODUCTS,
  override,
}: FakeBackendOptions = {}) {
  const calls: Call[] = [];

  const route = (call: Call): Reply => {
    const custom = override?.(call);
    if (custom) return custom;
    const { method, url } = call;
    const at = `${method} ${url.origin}${url.pathname}`;

    if (at === `POST ${AUTH}/auth/login`) {
      const { username, password } = call.body as { username: string; password: string };
      return username === VALID_USER.username && password === VALID_USER.password
        ? { body: { success: true, token: VALID_TOKEN } }
        : { status: 401, body: { success: false, message: 'Invalid credentials' } };
    }
    if (at === `POST ${AUTH}/auth/validate`) {
      return call.headers.get('Authorization') === `Bearer ${VALID_TOKEN}`
        ? { body: { success: true, message: 'Token is valid' } }
        : { status: 401, body: { success: false, message: 'Invalid token' } };
    }
    if (at === `GET ${API}/api/info`) {
      return isReply(info) ? info : { body: { success: true, data: info } };
    }
    if (at === `POST ${API}/api/info`) {
      const base = isReply(info) ? {} : info;
      return { body: { success: true, data: { ...base, ...(call.body as object) } } };
    }
    if (at === `GET ${API}/api/products`) {
      return isReply(products) ? products : { body: { success: true, data: products } };
    }
    if (
      at === `POST ${API}/api/products` ||
      (method === 'PUT' && url.pathname.startsWith('/api/products/'))
    ) {
      const form = call.body as FormData;
      const id = method === 'PUT' ? url.pathname.split('/').pop() : 'new-id';
      return {
        body: {
          success: true,
          data: { id, ...Object.fromEntries(form), price: Number(form.get('price')) },
        },
      };
    }
    if (method === 'DELETE' && url.pathname.startsWith('/api/products/')) {
      return { body: { success: true } };
    }
    if (at === `POST ${API}/api/homepage-image` || at === `POST ${API}/api/logo`) {
      return { body: { success: true } };
    }
    return 'network-error';
  };

  const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) => {
    const raw = init.body;
    const call: Call = {
      method: init.method ?? 'GET',
      url: new URL(String(input)),
      body: typeof raw === 'string' ? JSON.parse(raw) : raw,
      headers: new Headers(init.headers),
    };
    calls.push(call);
    return toResponse(route(call));
  });
  vi.stubGlobal('fetch', fetchMock);

  return {
    fetch: fetchMock,
    calls,
    /** Calls to `METHOD /path` on either host */
    callsTo: (method: string, pathname: string) =>
      calls.filter((c) => c.method === method && c.url.pathname === pathname),
  };
}

/** Renders the whole app (router, auth guard, admin provider) at `path`. */
export function renderApp(
  path = '/',
  { token, lang = 'en' }: { token?: string | null; lang?: Lang } = {},
) {
  localStorage.setItem(LANG_KEY, lang);
  if (token) localStorage.setItem('admin_token', token);
  window.history.pushState({}, '', path);
  const user = userEvent.setup();
  const utils = render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
  return { user, ...utils };
}

/** Types into a click-to-edit field and commits it the way the browser would (blur). */
export function editText(el: HTMLElement, text: string) {
  fireEvent.focus(el);
  el.textContent = text;
  // RTL's blur also dispatches focusout, which React's onBlur listens to
  fireEvent.blur(el);
}

export const pngFile = (name = 'photo.png', bytes = 64) =>
  new File([new Uint8Array(bytes)], name, { type: 'image/png' });
