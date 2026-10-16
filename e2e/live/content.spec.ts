import { expect, test } from '@playwright/test';
import { editField, editInEnglish, login, requireLiveBackend } from '../support';

// Reads the real store content. Saving store info is intercepted (and answered with what the
// API already holds) because the edit can't be undone exactly: an unset field would come back
// as an empty string. Image uploads are not exercised live at all (they overwrite R2 objects).
test.beforeEach(async ({ page, request }) => {
  await requireLiveBackend(request);
  await editInEnglish(page);
  await login(page);
});

for (const [path, field] of [
  ['/', 'Hero title'],
  ['/products', 'Products page title'],
  ['/contact', 'Contact title'],
] as const) {
  test(`${path} loads its editable content`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('textbox', { name: field, exact: true })).toBeVisible();
    await expect(page.getByText('Could not load the site content')).toHaveCount(0);
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  });
}

test('the product list matches what the API serves (cards or empty state)', async ({ page }) => {
  const response = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/products');
  await page.goto('/products');
  const body = await (await response).json();
  const count = Array.isArray(body.data) ? body.data.length : 0;

  await expect(page.getByRole('button', { name: 'Add product' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Edit / })).toHaveCount(count);
  await expect(
    page.getByText(count === 1 ? 'Showing 1 product' : `Showing ${count} products`),
  ).toBeVisible();
});

test('saving an edit sends only the changed field (save intercepted)', async ({ page }) => {
  const posted: unknown[] = [];
  await page.route(
    (url) => url.pathname === '/api/info',
    async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      const edit = route.request().postDataJSON();
      posted.push(edit);
      // Answer like the API: the stored info with the edit applied (nothing is written)
      const url = new URL(route.request().url());
      url.searchParams.set('lang', edit.lang);
      const current = await page.request.get(url.toString(), {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const { data } = await current.json();
      await route.fulfill({ json: { success: true, data: { ...data, ...edit } } });
    },
  );

  const field = page.getByRole('textbox', { name: 'Hero title', exact: true });
  await expect(field).toBeVisible();
  const original = (await field.textContent()) ?? '';
  const edited = `e2e-${Date.now()}`;

  await editField(page, 'Hero title', edited);
  await page.getByRole('button', { name: /^Save/ }).click();
  await expect(page.getByRole('status')).toHaveText(/Saved English content/);
  expect(posted).toEqual([{ heroTitle: edited, lang: 'en' }]);

  // Nothing reached the database
  await page.unrouteAll({ behavior: 'wait' });
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Hero title', exact: true })).toHaveText(original);
});
