import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MAX_IMAGE_BYTES } from '@/admin/context';
import { PRODUCTS, VALID_TOKEN, editText, fakeBackend, pngFile, renderApp } from '@/test/utils';

const openCatalogue = async () => {
  const utils = renderApp('/products', { token: VALID_TOKEN });
  await screen.findByRole('button', { name: 'Add product' });
  return utils;
};
const editButtons = () => screen.queryAllByRole('button', { name: /^Edit / });
const toast = () => screen.findByRole('status');
/** The hidden file input that belongs to an image button */
const fileInputOf = (name: string | RegExp) =>
  screen.getByRole('button', { name }).nextElementSibling as HTMLInputElement;

describe('product list', () => {
  it('shows one card per product with edit and delete controls', async () => {
    fakeBackend();
    await openCatalogue();

    expect(editButtons()).toHaveLength(PRODUCTS.length);
    expect(screen.getAllByRole('button', { name: /^Delete / })).toHaveLength(PRODUCTS.length);
    expect(screen.getByText(`Showing ${PRODUCTS.length} products`)).toBeInTheDocument();
  });

  it('shows an empty catalogue with only the add tile', async () => {
    fakeBackend({ products: [] });
    await openCatalogue();

    expect(editButtons()).toHaveLength(0);
    expect(screen.getByText('Showing 0 products')).toBeInTheDocument();
  });

  it('treats a malformed response as empty instead of crashing', async () => {
    fakeBackend({ products: { body: { success: true, data: null } } });
    await openCatalogue();
    expect(editButtons()).toHaveLength(0);
  });

  it('shows an error state when the products fail to load', async () => {
    fakeBackend({ products: { status: 500, body: { error: 'R2 unavailable' } } });
    renderApp('/products', { token: VALID_TOKEN });

    expect(await screen.findByText('Failed to load products')).toBeInTheDocument();
    expect(screen.getByText('R2 unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add product' })).toBeNull();
  });

  it('sorts by price', async () => {
    fakeBackend({
      products: [
        { id: 'a', title: 'Dear', price: 300 },
        { id: 'b', title: 'Cheap', price: 10 },
      ],
    });
    await openCatalogue();
    const order = () => editButtons().map((b) => b.getAttribute('aria-label'));

    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price-asc' } });
    expect(order()).toEqual(['Edit Cheap', 'Edit Dear']);
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price-desc' } });
    expect(order()).toEqual(['Edit Dear', 'Edit Cheap']);
  });
});

describe('adding a product', () => {
  const openNew = async () => {
    const utils = await openCatalogue();
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }));
    await screen.findByText('New product');
    return utils;
  };

  it('requires an image', async () => {
    const backend = fakeBackend();
    await openNew();

    editText(screen.getByRole('textbox', { name: 'Product name' }), 'No photo');
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }));

    expect(await toast()).toHaveTextContent('Choose an image for the new product');
    expect(backend.callsTo('POST', '/api/products')).toHaveLength(0);
  });

  it('rejects an image over the size limit', async () => {
    fakeBackend();
    const { user } = await openNew();

    await user.upload(fileInputOf('Choose image'), pngFile('big.png', MAX_IMAGE_BYTES + 1));

    expect(await toast()).toHaveTextContent('Image is larger than 10 MB');
    // Still no image chosen
    expect(screen.getByRole('button', { name: 'Choose image' })).toBeInTheDocument();
  });

  it('uploads the fields and image and adds the card', async () => {
    const backend = fakeBackend();
    const { user } = await openNew();

    await user.upload(fileInputOf('Choose image'), pngFile());
    editText(screen.getByRole('textbox', { name: 'Product name' }), 'Created in test');
    editText(screen.getByRole('textbox', { name: 'Price per square metre' }), '$1,250');
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }));

    expect(await toast()).toHaveTextContent('Product added');
    const form = backend.callsTo('POST', '/api/products')[0].body as FormData;
    expect(form.get('title')).toBe('Created in test');
    expect(form.get('price')).toBe('1250');
    expect(form.get('image')).toBeInstanceOf(File);
    // Unset fields are sent empty so the site falls back to its defaults
    expect(form.get('woodType')).toBe('');

    expect(await screen.findByRole('button', { name: 'Edit Created in test' })).toBeInTheDocument();
    expect(editButtons()).toHaveLength(PRODUCTS.length + 1);
  });

  it('keeps the editor open and reports a failed save', async () => {
    fakeBackend({
      override: (c) =>
        c.method === 'POST' && c.url.pathname === '/api/products'
          ? { status: 400, body: { error: 'Title is required' } }
          : undefined,
    });
    const { user } = await openNew();

    await user.upload(fileInputOf('Choose image'), pngFile());
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }));

    expect(await toast()).toHaveTextContent('Title is required');
    expect(screen.getByText('New product')).toBeInTheDocument();
  });
});

describe('editing a product', () => {
  const [first] = PRODUCTS;
  const openFirst = async () => {
    const utils = await openCatalogue();
    fireEvent.click(screen.getByRole('button', { name: `Edit ${first.title}` }));
    await screen.findByRole('textbox', { name: 'Product name' });
    return utils;
  };
  const saveProduct = () => screen.getByRole('button', { name: 'Save product' });

  it('enables saving only after a change', async () => {
    fakeBackend();
    await openFirst();

    expect(saveProduct()).toBeDisabled();
    editText(screen.getByRole('textbox', { name: 'Product description' }), 'Changed');
    expect(saveProduct()).toBeEnabled();
  });

  it('rejects a price that is not a number', async () => {
    fakeBackend();
    await openFirst();
    const price = screen.getByRole('textbox', { name: 'Price per square metre' });

    editText(price, 'cheap');
    expect(price).toHaveTextContent(String(first.price));
    editText(price, '-5');
    expect(price).toHaveTextContent(String(first.price));
    expect(saveProduct()).toBeDisabled();
  });

  it('saves the changes to that product and returns to the list', async () => {
    const backend = fakeBackend();
    await openFirst();

    editText(screen.getByRole('textbox', { name: 'Price per square metre' }), '99');
    fireEvent.click(saveProduct());

    expect(await toast()).toHaveTextContent('Product saved');
    const [call] = backend.calls.filter((c) => c.method === 'PUT');
    expect(call.url.pathname).toBe(`/api/products/${first.id}`);
    expect((call.body as FormData).get('price')).toBe('99');
    // No new image chosen, so none is uploaded
    expect((call.body as FormData).has('image')).toBe(false);
    expect(await screen.findByRole('button', { name: 'Add product' })).toBeInTheDocument();
    expect(editButtons()).toHaveLength(PRODUCTS.length);
  });

  it('asks before throwing away unsaved changes', async () => {
    fakeBackend();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await openFirst();

    editText(screen.getByRole('textbox', { name: 'Product name' }), 'Renamed');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(confirm).toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Product name' })).toHaveTextContent('Renamed');
  });
});

describe('deleting a product', () => {
  const [first] = PRODUCTS;
  const deleteFirst = () =>
    fireEvent.click(screen.getByRole('button', { name: `Delete ${first.title}` }));

  it('does nothing when the admin cancels', async () => {
    const backend = fakeBackend();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await openCatalogue();

    deleteFirst();

    expect(backend.calls.filter((c) => c.method === 'DELETE')).toHaveLength(0);
    expect(editButtons()).toHaveLength(PRODUCTS.length);
  });

  it('deletes that product after confirmation', async () => {
    const backend = fakeBackend();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await openCatalogue();

    deleteFirst();

    expect(await toast()).toHaveTextContent(`Deleted "${first.title}"`);
    expect(backend.calls.filter((c) => c.method === 'DELETE').map((c) => c.url.pathname)).toEqual([
      `/api/products/${first.id}`,
    ]);
    await waitFor(() => expect(editButtons()).toHaveLength(PRODUCTS.length - 1));
    expect(screen.queryByRole('button', { name: `Edit ${first.title}` })).toBeNull();
  });

  it('keeps the card when the delete fails', async () => {
    fakeBackend({
      override: (c) =>
        c.method === 'DELETE' ? { status: 500, body: { error: 'Delete failed' } } : undefined,
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await openCatalogue();

    deleteFirst();

    expect(await toast()).toHaveTextContent('Delete failed');
    expect(editButtons()).toHaveLength(PRODUCTS.length);
  });
});
