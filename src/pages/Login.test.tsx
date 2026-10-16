import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { VALID_TOKEN, VALID_USER, fakeBackend, renderApp } from '@/test/utils';

const loginForm = async () => {
  await screen.findByRole('heading', { name: 'Welcome Back' });
  return {
    username: screen.getByLabelText('Username'),
    password: screen.getByLabelText('Password'),
    submit: screen.getByRole('button', { name: 'Sign In' }),
  };
};

describe('login page', () => {
  it('renders the sign-in form', async () => {
    fakeBackend();
    renderApp('/login');
    const { username, password, submit } = await loginForm();

    expect(username).toBeRequired();
    expect(password).toBeRequired();
    expect(password).toHaveAttribute('type', 'password');
    expect(submit).toBeEnabled();
  });

  it('asks for both fields before calling the backend', async () => {
    const backend = fakeBackend();
    const { user } = renderApp('/login');
    const { username } = await loginForm();
    await user.type(username, 'admin');

    // Bypass the browser's own `required` check to reach the component's validation
    fireEvent.submit(username.closest('form')!);

    expect(await screen.findByText('Please enter both username and password.')).toBeVisible();
    expect(backend.callsTo('POST', '/auth/login')).toHaveLength(0);
  });

  it('shows the server error for bad credentials and stays logged out', async () => {
    fakeBackend();
    const { user } = renderApp('/login');
    const { username, password, submit } = await loginForm();

    await user.type(username, VALID_USER.username);
    await user.type(password, 'wrong-password');
    await user.click(submit);

    expect(await screen.findByText('Invalid credentials')).toBeVisible();
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(window.location.pathname).toBe('/login');
    // The form is usable again for another attempt
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
  });

  it('shows an error when the auth server is unreachable', async () => {
    fakeBackend({
      override: (c) => (c.url.pathname === '/auth/login' ? 'network-error' : undefined),
    });
    const { user } = renderApp('/login');
    const { username, password, submit } = await loginForm();

    await user.type(username, 'admin');
    await user.type(password, 'x');
    await user.click(submit);

    expect(await screen.findByText('Failed to fetch')).toBeVisible();
  });

  it('stores the token and opens the editable site with good credentials', async () => {
    const backend = fakeBackend();
    const { user } = renderApp('/login');
    const { username, password, submit } = await loginForm();

    await user.type(username, VALID_USER.username);
    await user.type(password, VALID_USER.password);
    await user.click(submit);

    expect(await screen.findByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(localStorage.getItem('admin_token')).toBe(VALID_TOKEN);
    expect(backend.callsTo('POST', '/auth/login')[0].body).toEqual(VALID_USER);
  });

  it('disables the button while signing in', async () => {
    let finish: (r: Response) => void = () => {};
    fakeBackend();
    const { user } = renderApp('/login');
    const { username, password, submit } = await loginForm();
    // Hold the login request open
    const pending = new Promise<Response>((resolve) => (finish = resolve));
    globalThis.fetch = () => pending;

    await user.type(username, 'admin');
    await user.type(password, 'x');
    await user.click(submit);

    expect(screen.getByRole('button', { name: /Signing In/ })).toBeDisabled();
    finish(
      new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
        status: 401,
      }),
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled());
  });

  it('sends an already logged-in admin straight to the site', async () => {
    fakeBackend();
    renderApp('/login', { token: VALID_TOKEN });

    expect(await screen.findByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });
});
