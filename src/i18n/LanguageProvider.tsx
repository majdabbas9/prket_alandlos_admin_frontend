import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { translate, type Lang, type TranslationKey } from './translations';
import { LanguageContext, type LanguageContextValue } from './LanguageContext';

// Separate from the public site's key so previewing a language here doesn't change it there
export const STORAGE_KEY = 'prket-alandlos-admin-lang';
export const DEFAULT_LANG: Lang = 'ar';

/** Saved user choice first, else Arabic (the site's default language). */
export function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ar' || saved === 'he') return saved;
  } catch {
    // localStorage unavailable — fall through to the default
  }
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useLayoutEffect(() => {
    const dir: 'ltr' | 'rtl' = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = `Admin · ${translate(lang, 'meta.title')}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', translate(lang, 'meta.description'));
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures — the language still applies for this session
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr',
      setLang,
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
