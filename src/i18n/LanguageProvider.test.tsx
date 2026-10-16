import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { DEFAULT_LANG, LanguageProvider, STORAGE_KEY, detectInitialLang } from './LanguageProvider';
import { useLanguage } from './LanguageContext';
import { translate } from './translations';

function Probe() {
  const { lang, dir, setLang, t } = useLanguage();
  return (
    <>
      <p data-testid="state">{`${lang} ${dir} ${t('nav.home')}`}</p>
      <button onClick={() => setLang('he')}>he</button>
    </>
  );
}

describe('language', () => {
  it('defaults to Arabic and ignores junk in storage', () => {
    expect(detectInitialLang()).toBe(DEFAULT_LANG);
    localStorage.setItem(STORAGE_KEY, 'fr');
    expect(detectInitialLang()).toBe(DEFAULT_LANG);
    localStorage.setItem(STORAGE_KEY, 'en');
    expect(detectInitialLang()).toBe('en');
  });

  it('applies direction, lang and title, and remembers the choice', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('state')).toHaveTextContent(`en ltr ${translate('en', 'nav.home')}`);
    expect(document.documentElement.dir).toBe('ltr');

    act(() => screen.getByRole('button', { name: 'he' }).click());

    expect(screen.getByTestId('state')).toHaveTextContent(`he rtl ${translate('he', 'nav.home')}`);
    expect(document.documentElement).toHaveAttribute('lang', 'he');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.title).toMatch(/^Admin · /);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('he');
  });
});
