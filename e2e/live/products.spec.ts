import { expect, test } from '@playwright/test';
import {
  TINY_PNG,
  apiToken,
  editField,
  editInEnglish,
  env,
  listProducts,
  login,
  requireLiveBackend,
} from '../support';

// Real writes to the shared database and R2 bucket. The test only touches a product it creates
// with a unique e2e-<timestamp> name; afterEach deletes it through the API if the UI did not
// (deleting a product also deletes its image and thumbnail from R2). Existing products are
// never edited or deleted.
test.describe.configure({ mode: 'serial' });

let name = '';

test.beforeEach(async ({ page, request }) => {
  await requireLiveBackend(request);
  name = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await editInEnglish(page);
  page.on('dialog', (d) => void d.accept());
  await login(page);
});

test.afterEach(async ({ request }) => {
  if (!name || !env.apiUrl) return;
  const leftovers = (await listProducts(request).catch(() => [])).filter((p) => p.title === name);
  if (leftovers.length === 0) return;
  const token = await apiToken(request);
  for (const p of leftovers) {
    const res = await request.delete(`${env.apiUrl}/api/products/${encodeURIComponent(p.id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok(), `cleanup of ${p.id} (${name}) failed: HTTP ${res.status()}`).toBe(true);
  }
});

test('create, edit and delete a product', async ({ page, request }) => {
  await page.goto('/products');

  // Create
  await page.getByRole('button', { name: 'Add product' }).click();
  await page
    .getByRole('button', { name: 'Choose image' })
    .locator('xpath=following-sibling::input[1]')
    .setInputFiles({ name: `${name}.png`, mimeType: 'image/png', buffer: TINY_PNG });
  await editField(page, 'Product name', name);
  await editField(page, 'Price per square metre', '1');
  await page.getByRole('button', { name: 'Add product' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Product added' })).toBeVisible();

  const editButton = page.getByRole('button', { name: `Edit ${name}`, exact: true });
  await expect(editButton).toBeVisible();
  const created = (await listProducts(request)).filter((p) => p.title === name);
  expect(created).toHaveLength(1);
  expect(Number(created[0].price)).toBe(1);

  // Edit (our own product only)
  await editButton.click();
  await editField(page, 'Price per square metre', '2');
  await page.getByRole('button', { name: 'Save product' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Product saved' })).toBeVisible();
  await expect
    .poll(async () => Number((await listProducts(request)).find((p) => p.title === name)?.price))
    .toBe(2);

  // Survives a reload: it came from the server, not local state
  await page.reload();
  await expect(page.getByRole('button', { name: `Edit ${name}`, exact: true })).toBeVisible();

  // Delete
  await page.getByRole('button', { name: `Delete ${name}`, exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: `Deleted "${name}"` })).toBeVisible();
  await expect(page.getByRole('button', { name: `Edit ${name}`, exact: true })).toHaveCount(0);
  await expect
    .poll(async () => (await listProducts(request)).filter((p) => p.title === name).length)
    .toBe(0);
});
