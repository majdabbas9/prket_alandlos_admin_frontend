import { expect, test } from '@playwright/test';
import { MOCK_TOKEN, MOCK_USER, TOKEN_KEY, editInEnglish, login, mockBackend } from '../support';

test.beforeEach(async ({ page }) => {
  await editInEnglish(page);
});

test('login page renders', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  await expect(page.getByLabel('Username')).toBeVisible();
  await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();
});

test('the browser blocks submitting empty fields', async ({ page }) => {
  await mockBackend(page);
  let loginCalls = 0;
  page.on('request', (r) => r.url().includes('/auth/login') && loginCalls++);
  await page.goto('/login');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByLabel('Username')).toHaveJSProperty('validity.valueMissing', true);
  expect(loginCalls).toBe(0);
  await expect(page).toHaveURL(/\/login$/);
});

test('bad credentials show an error', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/login');
  await page.getByLabel('Username').fill(MOCK_USER.username);
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY)).toBeNull();
});

test('good credentials open the editable site', async ({ page }) => {
  await mockBackend(page);
  await login(page, MOCK_USER.username, MOCK_USER.password);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('textbox', { name: 'Hero title' })).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY)).toBe(MOCK_TOKEN);
});

for (const path of ['/', '/products', '/contact']) {
  test(`${path} redirects to login when logged out`, async ({ page }) => {
    await mockBackend(page);
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
}

test('a rejected token sends the admin back to login', async ({ page }) => {
  await mockBackend(page, { validTokens: [] });
  await page.addInitScript((k) => localStorage.setItem(k, 'stale-token'), TOKEN_KEY);
  await page.goto('/products');
  await expect(page).toHaveURL(/\/login$/);
});

test('a stored "undefined" token does not loop between login and the site', async ({ page }) => {
  await mockBackend(page);
  await page.goto('/login');
  await page.evaluate((k) => localStorage.setItem(k, 'undefined'), TOKEN_KEY);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('logout ends the session', async ({ page }) => {
  await mockBackend(page);
  await login(page, MOCK_USER.username, MOCK_USER.password);

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY)).toBeNull();

  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('an expired session (API 401) returns to login', async ({ page }) => {
  await mockBackend(page, { info: 401 });
  await page.goto('/login');
  await page.getByLabel('Username').fill(MOCK_USER.username);
  await page.getByLabel('Password').fill(MOCK_USER.password);
  const infoRequest = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/info');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await infoRequest;

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY)).toBeNull();
});
