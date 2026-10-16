import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MAX_IMAGE_BYTES } from './context';
import { STORE_INFO, VALID_TOKEN, editText, fakeBackend, pngFile, renderApp } from '@/test/utils';

const openSite = async (path = '/') => {
  const utils = renderApp(path, { token: VALID_TOKEN });
  const heroTitle = await screen.findByRole('textbox', { name: 'Hero title' });
  return { ...utils, heroTitle };
};
const saveButton = () => screen.getByRole('button', { name: /^Save/ });
const toast = () => screen.findByRole('status');

describe('editing store content', () => {
  it('loads the edited language and shows its saved text', async () => {
    const backend = fakeBackend();
    const { heroTitle } = await openSite();

    expect(heroTitle).toHaveTextContent(STORE_INFO.heroTitle!);
    expect(backend.callsTo('GET', '/api/info')[0].url.searchParams.get('lang')).toBe('en');
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('saves only the changed fields for the edited language', async () => {
    const backend = fakeBackend();
    const { heroTitle } = await openSite();

    editText(heroTitle, 'A new hero title');
    expect(screen.getByText('1 unsaved')).toBeInTheDocument();
    expect(heroTitle).toHaveAttribute('data-dirty', 'true');

    fireEvent.click(saveButton());

    expect(await toast()).toHaveTextContent('Saved English content');
    expect(backend.callsTo('POST', '/api/info').map((c) => c.body)).toEqual([
      { heroTitle: 'A new hero title', lang: 'en' },
    ]);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(heroTitle).not.toHaveAttribute('data-dirty');
  });

  it('does not count an edit that puts the saved value back', async () => {
    fakeBackend();
    const { heroTitle } = await openSite();

    editText(heroTitle, 'Something else');
    editText(heroTitle, STORE_INFO.heroTitle!);

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('keeps the edits and shows the error when saving fails', async () => {
    fakeBackend({
      override: (c) =>
        c.method === 'POST' && c.url.pathname === '/api/info'
          ? { status: 500, body: { success: false, error: 'Database is read-only' } }
          : undefined,
    });
    const { heroTitle } = await openSite();

    editText(heroTitle, 'Unsaved title');
    fireEvent.click(saveButton());

    expect(await toast()).toHaveTextContent('Database is read-only');
    expect(screen.getByText('1 unsaved')).toBeInTheDocument();
    expect(heroTitle).toHaveTextContent('Unsaved title');
  });

  it('discards unsaved edits', async () => {
    const backend = fakeBackend();
    const { heroTitle } = await openSite();

    editText(heroTitle, 'Throwaway');
    fireEvent.click(screen.getByRole('button', { name: 'Discard unsaved changes' }));

    expect(heroTitle).toHaveTextContent(STORE_INFO.heroTitle!);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(backend.callsTo('POST', '/api/info')).toHaveLength(0);
  });

  it('saves with Ctrl+S', async () => {
    const backend = fakeBackend();
    const { heroTitle } = await openSite();

    editText(heroTitle, 'Keyboard save');
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });

    await toast();
    expect(backend.callsTo('POST', '/api/info')).toHaveLength(1);
  });

  it('toggles price visibility from the store settings', async () => {
    const backend = fakeBackend();
    await openSite();

    fireEvent.click(screen.getByRole('button', { name: 'Store settings' }));
    const checkbox = screen.getByRole('checkbox', { name: 'Show prices on the website' });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    fireEvent.click(saveButton());

    await toast();
    expect(backend.callsTo('POST', '/api/info')[0].body).toEqual({ showPrice: false, lang: 'en' });
  });

  it('shows an error with a retry button when the content fails to load', async () => {
    fakeBackend({ info: { status: 503, body: { error: 'Service temporarily unavailable' } } });
    renderApp('/', { token: VALID_TOKEN });

    expect(await screen.findByText('Could not load the site content')).toBeInTheDocument();
    expect(screen.getByText('Service temporarily unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Hero title' })).toBeNull();
  });
});

describe('switching the edited language', () => {
  const arabicButton = () => screen.getAllByRole('button', { name: 'العربية' })[0];

  it('loads the other language', async () => {
    const backend = fakeBackend();
    await openSite();

    fireEvent.click(arabicButton());

    await waitFor(() =>
      expect(
        backend.callsTo('GET', '/api/info').map((c) => c.url.searchParams.get('lang')),
      ).toEqual(['en', 'ar']),
    );
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('asks before dropping unsaved edits, and stays put when cancelled', async () => {
    const backend = fakeBackend();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { heroTitle } = await openSite();

    editText(heroTitle, 'Pending');
    fireEvent.click(arabicButton());

    expect(confirm).toHaveBeenCalledOnce();
    expect(backend.callsTo('GET', '/api/info')).toHaveLength(1);
    expect(heroTitle).toHaveTextContent('Pending');
  });
});

describe('image uploads', () => {
  const logoInput = () => {
    const button = screen.getAllByRole('button', { name: 'Change logo' })[0];
    return button.nextElementSibling as HTMLInputElement;
  };

  it('uploads a new logo', async () => {
    const backend = fakeBackend();
    const { user } = await openSite();

    await user.upload(logoInput(), pngFile('logo.png'));

    expect(await toast()).toHaveTextContent('Logo updated');
    const [call] = backend.callsTo('POST', '/api/logo');
    expect((call.body as FormData).get('image')).toBeInstanceOf(File);
  });

  it('refuses images over the size limit without uploading', async () => {
    const backend = fakeBackend();
    const { user } = await openSite();

    await user.upload(logoInput(), pngFile('huge.png', MAX_IMAGE_BYTES + 1));

    expect(await toast()).toHaveTextContent('Image is larger than 10 MB');
    expect(backend.callsTo('POST', '/api/logo')).toHaveLength(0);
  });

  it('reports a failed upload', async () => {
    fakeBackend({
      override: (c) =>
        c.url.pathname === '/api/homepage-image' && c.method === 'POST'
          ? { status: 413, body: { error: 'File too large' } }
          : undefined,
    });
    const { user } = await openSite();
    const heroButton = screen.getByRole('button', { name: 'Edit image' });

    await user.upload(heroButton.nextElementSibling as HTMLInputElement, pngFile());

    expect(await toast()).toHaveTextContent('File too large');
    expect(heroButton).toBeEnabled();
  });
});

describe('logout', () => {
  it('clears the session', async () => {
    fakeBackend();
    await openSite();
    // jsdom can't follow the redirect to /login; it reports that on the virtual console
    vi.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(localStorage.getItem('admin_token')).toBeNull();
  });
});
