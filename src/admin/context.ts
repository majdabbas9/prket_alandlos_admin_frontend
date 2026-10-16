import { createContext, useContext } from 'react';
import type { Lang } from '@/i18n/translations';
import type { StoreInfo } from '@/hooks/useInfo';

export type InfoField = Exclude<keyof StoreInfo, 'lang'>;
/** Info fields holding plain text (everything but the price toggle and the stats list) */
export type TextInfoField = Exclude<InfoField, 'showPrice' | 'stats'>;
export type ImageKind = 'hero' | 'logo';

export interface Toast {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

export interface AdminContextValue {
  /** Saved info of the current language with the unsaved edits applied; null while loading */
  info: StoreInfo | null;
  loading: boolean;
  loadError: string | null;
  dirtyFields: InfoField[];
  isDirty: (field: InfoField) => boolean;
  setField: <K extends InfoField>(field: K, value: StoreInfo[K]) => void;
  save: () => Promise<void>;
  discard: () => void;
  saving: boolean;
  /** Switches the edited language, asking first when that would drop unsaved edits */
  switchLang: (lang: Lang) => void;
  imageUrl: Record<ImageKind, string>;
  uploading: Record<ImageKind, boolean>;
  uploadImage: (kind: ImageKind, file: File) => Promise<void>;
  toasts: Toast[];
  notify: (kind: Toast['kind'], message: string) => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}

// Image types the backend upload middleware accepts, and its size limit
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif';
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
