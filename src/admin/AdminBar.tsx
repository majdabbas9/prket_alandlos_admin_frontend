import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  LogOut,
  Save,
  Settings,
  Undo2,
  X,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LANGS } from '@/i18n/translations';
import { useAdmin } from './context';
import { EditableText } from './Editable';

function logout() {
  localStorage.removeItem('admin_token');
  window.location.href = '/login';
}

/** Floating editor controls; kept left-to-right in English whatever language is edited */
export default function AdminBar() {
  const { lang } = useLanguage();
  const { info, dirtyFields, save, discard, saving, setField, isDirty, toasts } = useAdmin();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const count = dirtyFields.length;
  const langLabel = LANGS.find((l) => l.code === lang)?.label ?? lang;

  return (
    <div
      dir="ltr"
      lang="en"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 font-sans"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm shadow-lift animate-fade-up ${
            toast.kind === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      ))}

      {settingsOpen && info && (
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-ink-200 bg-white p-5 text-ink-800 shadow-lift animate-fade-up">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-600 text-walnut-900">Store settings</h2>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-sand-100/60 px-4 py-3 text-sm">
            <span>Show prices on the website</span>
            <input
              type="checkbox"
              checked={!!info.showPrice}
              onChange={(e) => setField('showPrice', e.target.checked)}
              className="h-5 w-5 accent-walnut-800"
            />
          </label>
          <div className="mt-3 rounded-xl bg-sand-100/60 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Contact email (not shown on the site)
            </p>
            <EditableText
              as="p"
              className="mt-1 block"
              value={info.email}
              onChange={(v) => setField('email', v)}
              label="Contact email"
              placeholder="name@example.com"
              dirty={isDirty('email')}
              dir="ltr"
              inputMode="email"
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-500">
            Click any text on the page to edit it. Faded italic text is the site&apos;s built-in
            default for an empty field — type over it to replace it. Phone, WhatsApp, email and
            price visibility are shared by all languages; everything else is saved for the language
            you are editing. Images and products are the same in every language.
          </p>
        </div>
      )}

      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-sand-50/10 bg-ink-950/95 p-1.5 text-sm text-sand-50 shadow-lift backdrop-blur-md">
        <span className="flex items-center gap-2 rounded-full bg-sand-50/10 px-3.5 py-2">
          <Globe className="h-4 w-4 text-brass-300" />
          <span className="hidden sm:inline text-sand-100/70">Editing</span>
          <span className="font-semibold">{langLabel}</span>
        </span>

        <span className="hidden items-center gap-2 px-3 text-sand-100/80 sm:flex">
          <span className={`h-2 w-2 rounded-full ${count > 0 ? 'bg-amber-400' : 'bg-green-400'}`} />
          {count > 0 ? `${count} unsaved` : 'Saved'}
        </span>

        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          aria-label="Store settings"
          aria-expanded={settingsOpen}
          title="Store settings"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-sand-50/10 ${
            isDirty('showPrice') || isDirty('email') ? 'text-amber-300' : ''
          }`}
        >
          <Settings className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={discard}
          disabled={count === 0 || saving}
          aria-label="Discard unsaved changes"
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors hover:bg-sand-50/10 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Undo2 className="h-4 w-4" />
          <span className="hidden sm:inline">Discard</span>
        </button>

        <button
          type="button"
          onClick={() => void save()}
          disabled={count === 0 || saving}
          title="Save (Ctrl+S)"
          className="flex items-center gap-1.5 rounded-full bg-brass-400 px-4 py-2 font-semibold text-ink-950 transition-colors hover:bg-brass-300 disabled:bg-sand-50/15 disabled:text-sand-50/50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save'}
          {/* The unsaved count lives in the status text, which is hidden on phones */}
          {!saving && count > 0 && <span className="sm:hidden">({count})</span>}
        </button>

        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-sand-100/70 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
