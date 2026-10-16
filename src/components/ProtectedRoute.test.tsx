import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { VALID_TOKEN, fakeBackend, renderApp } from '@/test/utils';

describe('protected routes', () => {
  it.each(['/', '/products', '/contact', '/some/unknown/page'])(
    'redirect %s to the login page when logged out',
    async (path) => {
      const backend = fakeBackend();
      renderApp(path);

      expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/login');
      // Nothing protected is fetched without a session
      expect(backend.callsTo('GET', '/api/info')).toHaveLength(0);
    },
  );

  it.each(['undefined', 'null'])('treat a stored "%s" token as logged out', async (token) => {
    const backend = fakeBackend();
    renderApp('/', { token });

    await screen.findByRole('heading', { name: 'Welcome Back' });
    expect(backend.callsTo('POST', '/auth/validate')).toHaveLength(0);
    // Cleared, so the login page doesn't bounce back to the site (it used to loop forever)
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(window.location.pathname).toBe('/login');
  });

  it('drop a token the auth server rejects and go to login', async () => {
    fakeBackend();
    renderApp('/products', { token: 'expired-or-forged' });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(localStorage.getItem('admin_token')).toBeNull();
  });

  it('go to login when the auth server is down', async () => {
    fakeBackend({
      override: (c) => (c.url.pathname === '/auth/validate' ? 'network-error' : undefined),
    });
    renderApp('/', { token: VALID_TOKEN });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });

  it('render the page for a valid session', async () => {
    fakeBackend();
    renderApp('/contact', { token: VALID_TOKEN });

    expect(await screen.findByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/contact');
    expect(await screen.findByRole('textbox', { name: 'Contact title' })).toBeInTheDocument();
  });

  it.each([
    ['/info', '/contact'],
    ['/logo', '/'],
  ])('redirect the old admin page %s to %s', async (from, to) => {
    fakeBackend();
    renderApp(from, { token: VALID_TOKEN });

    await screen.findByRole('button', { name: 'Log out' });
    await waitFor(() => expect(window.location.pathname).toBe(to));
  });
});
