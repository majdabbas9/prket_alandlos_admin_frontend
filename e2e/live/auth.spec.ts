import { expect, test } from '@playwright/test';
import { TOKEN_KEY, editInEnglish, env, login, requireLiveBackend } from '../support';

// Real auth Worker; nothing here writes data.
test.beforeEach(async ({ page, request }) => {
  await requireLiveBackend(request);
  await editInEnglish(page);
});

test('wrong password is rejected with an error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill(env.username);
  await page.getByLabel('Password').fill(`wrong-${Date.now()}`);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.locator('form').getByText(/invalid|failed|incorrect/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY)).toBeNull();
});

test('the admin signs in, the session survives a reload, and logout ends it', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/$/);

  // The stored token is validated again by the auth Worker on reload
  await page.reload();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/products');
  await expect(page).toHaveURL(/\/login$/);
});

test('a forged token is rejected by the auth Worker', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate((k) => localStorage.setItem(k, 'forged.e2e.token'), TOKEN_KEY);
  await page.goto('/');

  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate((k) => localStorage.getItem(k), TOKEN_KEY)).toBeNull();
});
