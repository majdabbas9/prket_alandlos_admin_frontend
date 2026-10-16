import { describe, expect, it, vi } from 'vitest';
import { API_BASE_URL, api, authApi } from './api';
import { API, AUTH, VALID_TOKEN, VALID_USER, fakeBackend } from '@/test/utils';

const json = (status: number, body: unknown) =>
  vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })));

describe('api client', () => {
  it('builds URLs from VITE_SERVER_URL', () => {
    expect(API_BASE_URL).toBe(`${API}/api`);
  });

  it('sends the stored token as a Bearer header with JSON requests', async () => {
    localStorage.setItem('admin_token', 'abc');
    const backend = fakeBackend();

    await api.post('/info', { heroTitle: 'x', lang: 'en' });

    const [call] = backend.callsTo('POST', '/api/info');
    expect(call.headers.get('Authorization')).toBe('Bearer abc');
    expect(call.headers.get('Content-Type')).toBe('application/json');
    expect(call.body).toEqual({ heroTitle: 'x', lang: 'en' });
  });

  it('sends no Authorization header when logged out', async () => {
    const backend = fakeBackend();
    await api.get('/products');
    expect(backend.calls[0].headers.has('Authorization')).toBe(false);
  });

  it('lets the browser set the multipart Content-Type for uploads', async () => {
    localStorage.setItem('admin_token', 'abc');
    const backend = fakeBackend();
    const form = new FormData();
    form.append('image', new Blob(['x']), 'x.png');

    await api.postFormData('/logo', form);
    await api.putFormData('/products/p1', form);

    for (const call of backend.calls) {
      // A hand-written multipart Content-Type would have no boundary and break the upload
      expect(call.headers.has('Content-Type')).toBe(false);
      expect(call.headers.get('Authorization')).toBe('Bearer abc');
      expect(call.body).toBe(form);
    }
    expect(backend.calls.map((c) => c.method)).toEqual(['POST', 'PUT']);
  });

  it('returns the parsed body on success', async () => {
    fakeBackend({ products: { body: { success: true, data: [] } } });
    await expect(api.get('/products')).resolves.toEqual({ success: true, data: [] });
  });

  it.each([
    ['error', { error: 'Title too long' }, 'Title too long'],
    ['message', { message: 'Bad input' }, 'Bad input'],
  ])('surfaces the server %s field on failure', async (_, body, message) => {
    vi.stubGlobal('fetch', json(400, body));
    await expect(api.put('/info', {})).rejects.toThrow(message);
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('<html>502</html>', { status: 502 }))),
    );
    await expect(api.delete('/products/p1')).rejects.toThrow('DELETE /products/p1 failed');
  });

  it('drops the token when the API answers 401', async () => {
    localStorage.setItem('admin_token', 'expired');
    vi.stubGlobal('fetch', json(401, { message: 'jwt expired' }));
    // Already on /login, so no navigation is attempted (jsdom can't navigate)
    window.history.pushState({}, '', '/login');

    await expect(api.get('/info?lang=en')).rejects.toThrow(/login again/i);
    expect(localStorage.getItem('admin_token')).toBeNull();
  });

  it('propagates network failures', async () => {
    fakeBackend({ products: 'network-error' });
    await expect(api.get('/products')).rejects.toThrow('Failed to fetch');
  });
});

describe('authApi', () => {
  it('logs in against the admin backend and returns the token', async () => {
    const backend = fakeBackend();
    const result = await authApi.login(VALID_USER.username, VALID_USER.password);

    expect(result.token).toBe(VALID_TOKEN);
    expect(backend.calls[0].url.origin).toBe(AUTH);
    expect(backend.calls[0].url.pathname).toBe('/auth/login');
  });

  it('rejects wrong credentials with the server message', async () => {
    fakeBackend();
    await expect(authApi.login('admin', 'nope')).rejects.toThrow('Invalid credentials');
  });

  it('rejects a 200 response that reports success: false', async () => {
    vi.stubGlobal('fetch', json(200, { success: false }));
    await expect(authApi.login('a', 'b')).rejects.toThrow('Login failed');
  });

  it('validates a token by sending it as a Bearer header', async () => {
    const backend = fakeBackend();
    await expect(authApi.validate(VALID_TOKEN)).resolves.toMatchObject({ success: true });
    expect(backend.calls[0].headers.get('Authorization')).toBe(`Bearer ${VALID_TOKEN}`);
    await expect(authApi.validate('forged')).rejects.toThrow('Invalid token');
  });
});
