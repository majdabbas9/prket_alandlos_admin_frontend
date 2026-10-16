import { expect, test } from '@playwright/test';
import {
  MOCK_INFO,
  MOCK_USER,
  TINY_PNG,
  editField,
  editInEnglish,
  login,
  mockBackend,
} from '../support';

test.beforeEach(async ({ page }) => {
  await editInEnglish(page);
});

const signIn = (page: Parameters<typeof login>[0]) =>
  login(page, MOCK_USER.username, MOCK_USER.password);

test.describe('site content', () => {
  test('editing text marks it unsaved and saves only that field', async ({ page }) => {
    const { writes } = await mockBackend(page);
    await signIn(page);

    await editField(page, 'Hero title', 'Edited by e2e');
    await expect(page.getByText('1 unsaved')).toBeVisible();

    await page.getByRole('button', { name: /^Save/ }).click();
    await expect(page.getByRole('status')).toHaveText(/Saved English content/);

    expect(writes).toHaveLength(1);
    expect(writes[0].path).toBe('/api/info');
    expect(JSON.parse(writes[0].body!)).toEqual({ heroTitle: 'Edited by e2e', lang: 'en' });
  });

  test('discard puts the saved text back', async ({ page }) => {
    const { writes } = await mockBackend(page);
    await signIn(page);

    const field = await editField(page, 'Hero title', 'Throwaway');
    await page.getByRole('button', { name: 'Discard unsaved changes' }).click();

    await expect(field).toHaveText(MOCK_INFO.heroTitle);
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    expect(writes).toHaveLength(0);
  });

  test('a rejected save shows the error', async ({ page }) => {
    await mockBackend(page, { failWrites: 500 });
    await signIn(page);

    await editField(page, 'Hero title', 'Will fail');
    await page.getByRole('button', { name: /^Save/ }).click();

    await expect(
      page.getByRole('status').filter({ hasText: /Mocked HTTP 500|fail/i }),
    ).toBeVisible();
    await expect(page.getByText('1 unsaved')).toBeVisible();
  });

  test('a load failure shows an error state', async ({ page }) => {
    await mockBackend(page, { info: 500 });
    await page.goto('/login');
    await page.getByLabel('Username').fill(MOCK_USER.username);
    await page.getByLabel('Password').fill(MOCK_USER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Could not load the site content')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});

test.describe('products', () => {
  test('an empty catalogue shows only the add tile', async ({ page }) => {
    await mockBackend(page, { products: [] });
    await signIn(page);
    await page.goto('/products');

    await expect(page.getByRole('button', { name: 'Add product' })).toBeVisible();
    await expect(page.getByText('Showing 0 products')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Edit / })).toHaveCount(0);
  });

  // The mock's own data, so its size is known here (the live suite never hard-codes counts)
  const MOCK_PRODUCTS = [
    { id: 'mock-1', title: 'Mock oak', price: 10, imageKey: 'products/mock-1.png' },
    { id: 'mock-2', title: 'Mock walnut', price: 20, imageKey: 'products/mock-2.png' },
  ];

  test('a catalogue renders one card per product', async ({ page }) => {
    await mockBackend(page, { products: MOCK_PRODUCTS });
    await signIn(page);
    await page.goto('/products');

    for (const p of MOCK_PRODUCTS) {
      await expect(
        page.getByRole('button', { name: `Edit ${p.title}`, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: `Delete ${p.title}`, exact: true }),
      ).toBeVisible();
    }
    await expect(page.getByText(`Showing ${MOCK_PRODUCTS.length} products`)).toBeVisible();
  });

  test('a rejected delete shows the error and keeps the product', async ({ page }) => {
    const { writes } = await mockBackend(page, { products: MOCK_PRODUCTS, failWrites: 500 });
    page.on('dialog', (d) => void d.accept());
    await signIn(page);
    await page.goto('/products');

    const title = MOCK_PRODUCTS[0].title;
    await page.getByRole('button', { name: `Delete ${title}`, exact: true }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Mocked HTTP 500' })).toBeVisible();
    await expect(page.getByRole('button', { name: `Edit ${title}`, exact: true })).toBeVisible();
    expect(writes.map((w) => `${w.method} ${w.path}`)).toEqual([`DELETE /api/products/mock-1`]);
  });

  test('a failed load shows an error state', async ({ page }) => {
    await mockBackend(page, { products: 500 });
    await signIn(page);
    await page.goto('/products');

    await expect(page.getByText('Failed to load products')).toBeVisible();
  });

  test('a new product needs an image before it is sent', async ({ page }) => {
    const { writes } = await mockBackend(page, { products: [] });
    await signIn(page);
    await page.goto('/products');

    await page.getByRole('button', { name: 'Add product' }).click();
    await editField(page, 'Product name', 'No image');
    await page.getByRole('button', { name: 'Add product' }).click();

    await expect(page.getByRole('status')).toHaveText(/Choose an image/);
    expect(writes).toHaveLength(0);

    // With an image it is sent as multipart
    await page
      .getByRole('button', { name: 'Choose image' })
      .locator('xpath=following-sibling::input[1]')
      .setInputFiles({
        name: 'e2e.png',
        mimeType: 'image/png',
        buffer: TINY_PNG,
      });
    await page.getByRole('button', { name: 'Add product' }).click();
    await expect(page.getByRole('status').last()).toHaveText(/Product added/);
    expect(writes.map((w) => `${w.method} ${w.path}`)).toEqual(['POST /api/products']);
    expect(writes[0].body).toContain('name="image"');
  });
});
