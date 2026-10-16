import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, API_BASE_URL } from '@/api';
import { useLanguage } from '@/i18n/LanguageContext';
import { LANGS, type Lang } from '@/i18n/translations';
import type { StoreInfo } from '@/hooks/useInfo';
import {
  AdminContext,
  MAX_IMAGE_BYTES,
  type AdminContextValue,
  type ImageKind,
  type InfoField,
  type Toast,
} from './context';

const IMAGE_ENDPOINT: Record<ImageKind, string> = { hero: '/homepage-image', logo: '/logo' };
const IMAGE_LABEL: Record<ImageKind, string> = { hero: 'Homepage image', logo: 'Logo' };

const langLabel = (code: Lang) => LANGS.find((l) => l.code === code)?.label ?? code;
const errorText = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;
// Unset and empty text mean the same thing on the site (it shows its built-in copy)
const sameValue = (a: unknown, b: unknown) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');

/**
 * Holds the edited language's store info: the saved copy from the API plus a set of unsaved
 * edits, which are POSTed together for that language. Also uploads the hero image and logo.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLanguage();
  const [saved, setSaved] = useState<StoreInfo | null>(null);
  const [edits, setEdits] = useState<Partial<StoreInfo>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Bumped after an upload so the <img> tags refetch instead of showing a cached copy
  const [imageVersion, setImageVersion] = useState(() => ({ hero: Date.now(), logo: Date.now() }));
  const [uploading, setUploading] = useState<Record<ImageKind, boolean>>({
    hero: false,
    logo: false,
  });

  // Mirrors for save(): an edit committed on blur right before saving is not rendered yet
  const savedRef = useRef(saved);
  const editsRef = useRef(edits);
  savedRef.current = saved;
  editsRef.current = edits;

  const notify = useCallback((kind: Toast['kind'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, kind, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSaved(null);
    setEdits({});
    editsRef.current = {};
    api
      .get(`/info?lang=${lang}`)
      .then((res) => {
        if (!cancelled) setSaved(res.data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorText(err, 'Failed to load store information'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setField = useCallback(<K extends InfoField>(field: K, value: StoreInfo[K]) => {
    const next = { ...editsRef.current };
    if (sameValue(savedRef.current?.[field], value)) delete next[field];
    else next[field] = value;
    editsRef.current = next;
    setEdits(next);
  }, []);

  const discard = useCallback(() => {
    editsRef.current = {};
    setEdits({});
  }, []);

  const save = useCallback(async () => {
    // Commit the text being typed (editables save on blur)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const pending = editsRef.current;
    if (Object.keys(pending).length === 0) return;
    setSaving(true);
    try {
      const res = await api.post('/info', { ...pending, lang });
      setSaved(res.data);
      // Keep anything typed while the request was in flight
      const rest = { ...editsRef.current };
      for (const key of Object.keys(pending) as InfoField[]) {
        if (sameValue(rest[key], pending[key])) delete rest[key];
      }
      editsRef.current = rest;
      setEdits(rest);
      notify('success', `Saved ${langLabel(lang)} content`);
    } catch (err) {
      notify('error', errorText(err, 'Failed to save changes'));
    } finally {
      setSaving(false);
    }
  }, [lang, notify]);

  const dirtyFields = useMemo(() => Object.keys(edits) as InfoField[], [edits]);
  const hasEdits = dirtyFields.length > 0;

  const switchLang = useCallback(
    (next: Lang) => {
      if (next === lang || saving) return;
      if (
        Object.keys(editsRef.current).length > 0 &&
        !window.confirm(
          `You have unsaved changes in ${langLabel(lang)}. Discard them and switch to ${langLabel(next)}?`,
        )
      ) {
        return;
      }
      setLang(next);
    },
    [lang, saving, setLang],
  );

  const uploadImage = useCallback(
    async (kind: ImageKind, file: File) => {
      if (file.size > MAX_IMAGE_BYTES) {
        notify('error', 'Image is larger than 10 MB');
        return;
      }
      const formData = new FormData();
      formData.append('image', file);
      setUploading((u) => ({ ...u, [kind]: true }));
      try {
        await api.postFormData(IMAGE_ENDPOINT[kind], formData);
        setImageVersion((v) => ({ ...v, [kind]: Date.now() }));
        notify('success', `${IMAGE_LABEL[kind]} updated`);
      } catch (err) {
        notify('error', errorText(err, `Failed to upload ${IMAGE_LABEL[kind].toLowerCase()}`));
      } finally {
        setUploading((u) => ({ ...u, [kind]: false }));
      }
    },
    [notify],
  );

  // Warn before leaving the page with unsaved edits
  useEffect(() => {
    if (!hasEdits) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasEdits]);

  // Ctrl/Cmd+S saves
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [save]);

  const value = useMemo<AdminContextValue>(
    () => ({
      info: saved ? { ...saved, ...edits } : null,
      loading,
      loadError,
      dirtyFields,
      isDirty: (field) => field in edits,
      setField,
      save,
      discard,
      saving,
      switchLang,
      imageUrl: {
        hero: `${API_BASE_URL}/homepage-image?v=${imageVersion.hero}`,
        logo: `${API_BASE_URL}/logo?v=${imageVersion.logo}`,
      },
      uploading,
      uploadImage,
      toasts,
      notify,
    }),
    [
      saved,
      edits,
      loading,
      loadError,
      dirtyFields,
      setField,
      save,
      discard,
      saving,
      switchLang,
      imageVersion,
      uploading,
      uploadImage,
      toasts,
      notify,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
