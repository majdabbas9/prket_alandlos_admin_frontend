import {
  createElement,
  useLayoutEffect,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { ImagePlus, Loader2, Pencil } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { parseOpeningTime } from '@/hooks/useInfo';
import { IMAGE_ACCEPT, useAdmin, type TextInfoField } from './context';

/** Text of an editable element, turning <br> and block elements back into line breaks */
function readText(node: Node): string {
  let out = '';
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.nodeValue ?? '';
    } else if (child.nodeName === 'BR') {
      out += '\n';
    } else {
      if ((child.nodeName === 'DIV' || child.nodeName === 'P') && out && !out.endsWith('\n')) {
        out += '\n';
      }
      out += readText(child);
    }
  });
  return out;
}

export interface EditableTextProps {
  value: string | undefined;
  onChange: (value: string) => void;
  /** Accessible name of the field, e.g. "Hero title" */
  label: string;
  as?: ElementType;
  className?: string;
  /** Shown dimmed while empty — pass what the public site shows in that case */
  placeholder?: string;
  multiline?: boolean;
  dirty?: boolean;
  dir?: 'ltr' | 'rtl';
  inputMode?: HTMLAttributes<HTMLElement>['inputMode'];
  /** Cleans up typed text; returning null rejects it and restores the previous value */
  normalize?: (text: string) => string | null;
}

/**
 * Click-to-edit text that renders with the same element and classes as the public site.
 * The DOM is managed directly (not as React children) so the caret never jumps while typing;
 * the value is committed on blur or Enter, and Escape reverts.
 */
export function EditableText({
  value = '',
  onChange,
  label,
  as = 'span',
  className = '',
  placeholder,
  multiline = false,
  dirty = false,
  dir,
  inputMode,
  normalize,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && readText(el) !== value) el.textContent = value;
  }, [value]);

  const commit = () => {
    const el = ref.current;
    if (!el) return;
    const raw = readText(el);
    let next: string | null = multiline ? raw.trim() : raw.replace(/\s*\n\s*/g, ' ').trim();
    if (normalize) next = normalize(next);
    if (next === null) next = value;
    // Re-render as plain text: drops stray <br>s so an emptied field shows its placeholder
    el.textContent = next;
    if (next !== value) onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.textContent = value;
      e.currentTarget.blur();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return createElement(as, {
    ref,
    className: `editable ${className}`,
    contentEditable: 'plaintext-only',
    suppressContentEditableWarning: true,
    role: 'textbox',
    'aria-label': label,
    'aria-multiline': multiline || undefined,
    'data-placeholder': placeholder,
    'data-dirty': dirty ? 'true' : undefined,
    dir,
    inputMode,
    spellCheck: true,
    onBlur: commit,
    onKeyDown,
  });
}

type InfoTextProps = Omit<EditableTextProps, 'value' | 'onChange' | 'dirty' | 'placeholder'> & {
  field: TextInfoField;
  /** The site's built-in text, used when this field is empty */
  fallback?: string;
};

/** EditableText bound to one store-info field of the edited language */
export function InfoText({ field, fallback, ...rest }: InfoTextProps) {
  const { info, setField, isDirty } = useAdmin();
  return (
    <EditableText
      value={info?.[field] ?? ''}
      onChange={(v) => setField(field, v)}
      dirty={isDirty(field)}
      placeholder={fallback}
      {...rest}
    />
  );
}

/**
 * The opening hours as the site shows them — a days part and a time part — both editable.
 * They are stored together as one string ("Sunday — Friday 10:00 AM — 6:00 PM").
 */
export function OpeningHoursText({
  daysAs = 'span',
  timeAs = 'span',
  daysClassName = '',
  timeClassName = '',
}: {
  daysAs?: ElementType;
  timeAs?: ElementType;
  daysClassName?: string;
  timeClassName?: string;
}) {
  const { t } = useLanguage();
  const { info, setField, isDirty } = useAdmin();
  const { days, time } = parseOpeningTime(info?.storeOpeningTime ?? '');
  const dirty = isDirty('storeOpeningTime');
  const update = (d: string, tm: string) =>
    setField('storeOpeningTime', [d, tm].filter(Boolean).join(' '));

  return (
    <>
      <EditableText
        as={daysAs}
        className={daysClassName}
        value={days}
        onChange={(d) => update(d, time)}
        label="Opening days"
        placeholder={t('footer.hoursSunThu')}
        dirty={dirty}
      />
      <EditableText
        as={timeAs}
        className={timeClassName}
        value={time}
        onChange={(tm) => update(days, tm)}
        label="Opening time, e.g. 10:00 AM — 6:00 PM"
        placeholder={t('footer.hoursSunThuTime')}
        dirty={dirty}
      />
    </>
  );
}

/** Opens a file picker for an image; `compact` renders a small round pencil button */
export function ImageButton({
  onFile,
  busy = false,
  label,
  compact = false,
  className = '',
}: {
  onFile: (file: File) => void;
  busy?: boolean;
  label: string;
  compact?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = busy ? Loader2 : compact ? Pencil : ImagePlus;

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={label}
        title={label}
        className={
          compact
            ? `flex h-6 w-6 items-center justify-center rounded-full bg-brass-400 text-ink-950 shadow-card transition-transform hover:scale-110 disabled:opacity-70 ${className}`
            : `inline-flex items-center gap-2 rounded-full bg-ink-950/75 px-4 py-2.5 text-xs font-semibold text-sand-50 shadow-lift backdrop-blur-md transition-colors hover:bg-ink-950/95 disabled:opacity-70 ${className}`
        }
      >
        <Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${busy ? 'animate-spin' : ''}`} />
        {!compact && (busy ? 'Uploading…' : label)}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onFile(file);
        }}
      />
    </>
  );
}
