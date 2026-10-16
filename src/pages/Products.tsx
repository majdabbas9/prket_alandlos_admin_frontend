import { useEffect, useMemo, useState } from 'react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ArrowRight,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { api, API_BASE_URL } from '@/api';
import { WOOD_TYPES, FINISHES } from '@/data/products';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/i18n/LanguageContext';
import { MAX_IMAGE_BYTES, useAdmin } from '@/admin/context';
import { EditableText, ImageButton, InfoText } from '@/admin/Editable';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

/** Product as GET /api/products returns it */
interface ApiProduct {
  id: string;
  title?: string;
  price?: number;
  description?: string;
  woodType?: string;
  finish?: string;
  thickness?: string;
  plankSize?: string;
  tag?: string;
  imageKey?: string;
  thumbKey?: string;
  imageUrl?: string;
  thumbUrl?: string;
}

/** A product being edited; no id = not created yet */
type Draft = Omit<ApiProduct, 'id'> & { id?: string };

const TEXT_FIELDS = [
  'title',
  'description',
  'woodType',
  'finish',
  'thickness',
  'plankSize',
  'tag',
] as const;

// What the public site shows when a field is unset
const SITE_DEFAULTS = {
  title: 'Untitled Product',
  woodType: 'Oak',
  finish: 'Brushed',
  thickness: '15 mm',
  plankSize: '190 × 1900 mm',
};

const photoUrl = (key?: string) =>
  key ? `${API_BASE_URL}/products/photo?key=${encodeURIComponent(key)}` : '';
const imageOf = (p: Draft) => p.imageUrl || photoUrl(p.imageKey);
const thumbOf = (p: Draft) => p.thumbUrl || photoUrl(p.thumbKey || p.imageKey);
const errorText = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

function Price({
  price,
  showPrice,
  className,
}: {
  price?: number;
  showPrice: boolean;
  className: string;
}) {
  const { t } = useLanguage();
  return (
    <p
      className={`${className} ${showPrice ? '' : 'opacity-40'}`}
      title={showPrice ? undefined : 'Prices are hidden on the website'}
    >
      ${price || 0}
      <span className="block text-end text-xs font-400 text-ink-400">{t('products.perSqm')}</span>
    </p>
  );
}

function ProductCard({
  product,
  index,
  showPrice,
  onEdit,
  onDelete,
}: {
  product: ApiProduct;
  index: number;
  showPrice: boolean;
  onEdit: (product: ApiProduct) => void;
  onDelete: (product: ApiProduct) => void;
}) {
  const { t } = useLanguage();
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const name = product.title || SITE_DEFAULTS.title;
  const finish = product.finish || SITE_DEFAULTS.finish;
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={thumbOf(product)}
          alt={name}
          width={600}
          height={450}
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.tag && (
          <span className="absolute start-4 top-4 rounded-full bg-walnut-800 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-sand-50 shadow-soft">
            {product.tag}
          </span>
        )}
        <div className="absolute end-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            aria-label={`Edit ${name}`}
            title="Edit"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-walnut-800 shadow-card transition-colors hover:bg-walnut-800 hover:text-sand-50"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            aria-label={`Delete ${name}`}
            title="Delete"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-card transition-colors hover:bg-red-600 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-600 leading-tight text-walnut-900">{name}</h3>
          <Price
            price={product.price}
            showPrice={showPrice}
            className="shrink-0 font-display text-lg font-700 text-brass-600"
          />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-500 line-clamp-2">
          {product.description}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-ink-200/60 pt-5">
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
              {t('products.thickness')}
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">
              {product.thickness || SITE_DEFAULTS.thickness}
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
              {t('products.plankSize')}
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">
              {product.plankSize || SITE_DEFAULTS.plankSize}
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
              {t('products.finish')}
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">{finish}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center gap-2">
          <span className="rounded-full bg-walnut-800/8 px-3 py-1 text-xs font-medium text-walnut-800">
            {product.woodType || SITE_DEFAULTS.woodType}
          </span>
          <span className="rounded-full bg-sand-200/60 px-3 py-1 text-xs font-medium text-sand-800">
            {finish}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEdit(product)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-walnut-800/25 py-3 text-sm font-medium tracking-wide text-walnut-800 transition-all duration-300 hover:bg-walnut-800 hover:text-sand-50 group/btn"
        >
          {t('products.viewDetails')}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1" />
        </button>
      </div>
    </div>
  );
}

/** The site's product detail view, with every field editable */
function ProductEditor({
  original,
  showPrice,
  onClose,
  onSaved,
  onDelete,
}: {
  original: Draft;
  showPrice: boolean;
  onClose: () => void;
  onSaved: (product: ApiProduct) => void;
  onDelete: (product: ApiProduct) => void;
}) {
  const { t } = useLanguage();
  const { notify } = useAdmin();
  const [draft, setDraft] = useState<Draft>(original);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isNew = !original.id;

  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  const changed = (field: keyof Draft) => (draft[field] ?? '') !== (original[field] ?? '');
  const dirty = !!file || TEXT_FIELDS.some(changed) || changed('price');
  const set = (field: keyof Draft) => (value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const pickImage = (f: File) => {
    if (f.size > MAX_IMAGE_BYTES) {
      notify('error', 'Image is larger than 10 MB');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const close = () => {
    if (dirty && !window.confirm('Discard your changes to this product?')) return;
    onClose();
  };

  const save = async () => {
    if (isNew && !file) {
      notify('error', 'Choose an image for the new product');
      return;
    }
    const formData = new FormData();
    for (const field of TEXT_FIELDS) formData.append(field, draft[field] ?? '');
    formData.append('price', String(draft.price ?? 0));
    if (file) formData.append('image', file);
    setSaving(true);
    try {
      const res = isNew
        ? await api.postFormData('/products', formData)
        : await api.putFormData(`/products/${original.id}`, formData);
      notify('success', isNew ? 'Product added' : 'Product saved');
      onSaved(res.data);
    } catch (err) {
      notify('error', errorText(err, 'Failed to save product'));
    } finally {
      setSaving(false);
    }
  };

  const spec = (field: 'woodType' | 'finish' | 'thickness' | 'plankSize', label: string) => (
    <div className="border-b border-ink-100 pb-2">
      <dt className="text-xs uppercase tracking-wider text-ink-400 font-semibold">{label}</dt>
      <EditableText
        as="dd"
        value={draft[field]}
        onChange={set(field)}
        label={label}
        placeholder={SITE_DEFAULTS[field]}
        dirty={changed(field)}
        className="mt-1 block text-sm font-medium text-ink-800"
      />
    </div>
  );

  const image = previewUrl || imageOf(draft);

  return (
    <div className="animate-fade-in">
      {/* Back button & Breadcrumb */}
      <div className="mb-10 flex items-center gap-3">
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-2 text-sm font-medium text-walnut-800 transition-colors hover:text-walnut-600 font-semibold"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('products.backToCollection')}
        </button>
        <span className="text-ink-300">/</span>
        <span className="text-sm font-medium text-ink-600">
          {isNew ? 'New product' : draft.title || SITE_DEFAULTS.title}
        </span>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Full Image view */}
        <div className="lg:col-span-7">
          <div
            className={`relative overflow-hidden rounded-3xl bg-sand-50 border p-2 shadow-soft ${
              file ? 'border-amber-400 ring-2 ring-amber-400' : 'border-ink-200/60'
            }`}
          >
            {image ? (
              <img
                src={image}
                alt={draft.title || SITE_DEFAULTS.title}
                decoding="async"
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl mx-auto shadow-sm"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-sand-100 text-ink-400">
                <ImageIcon className="h-12 w-12" />
                <p className="text-sm">A product needs an image</p>
              </div>
            )}
            <div className="absolute end-5 top-5">
              <ImageButton label={image ? 'Change image' : 'Choose image'} onFile={pickImage} />
            </div>
          </div>
        </div>

        {/* Specs and action info */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <EditableText
              as="span"
              value={draft.tag}
              onChange={set('tag')}
              label="Tag (optional, e.g. Bestseller)"
              placeholder="Add a tag"
              dirty={changed('tag')}
              className={`inline-block rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide shadow-soft mb-4 ${
                draft.tag ? 'bg-walnut-800 text-sand-50' : 'bg-walnut-800/10 text-walnut-800'
              }`}
            />
            <EditableText
              as="h2"
              value={draft.title}
              onChange={set('title')}
              label="Product name"
              placeholder={SITE_DEFAULTS.title}
              dirty={changed('title')}
              className="block font-display text-4xl font-700 text-walnut-900 leading-tight"
            />

            <div className="mt-4 flex items-center gap-3">
              <p
                className={`font-display text-2xl font-700 text-brass-600 ${showPrice ? '' : 'opacity-50'}`}
              >
                $
                <EditableText
                  value={String(draft.price ?? 0)}
                  onChange={(v) => setDraft((d) => ({ ...d, price: Number(v) }))}
                  label="Price per square metre"
                  dirty={changed('price')}
                  inputMode="decimal"
                  normalize={(s) => {
                    const n = Number(s.replace(/[$,\s]/g, '') || 0);
                    return Number.isFinite(n) && n >= 0 ? String(n) : null;
                  }}
                />
                <span className="text-sm font-400 text-ink-400 ms-1">{t('products.perSqm')}</span>
              </p>
              {!showPrice && (
                <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-500">
                  <EyeOff className="h-3.5 w-3.5" />
                  Hidden on site
                </span>
              )}
            </div>

            <div className="mt-6 border-t border-ink-200/60 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-walnut-900 mb-3">
                {t('products.description')}
              </h3>
              <EditableText
                as="p"
                value={draft.description}
                onChange={set('description')}
                label="Product description"
                placeholder="Add a description"
                multiline
                dirty={changed('description')}
                className="block text-base leading-relaxed text-ink-600"
              />
            </div>

            <div className="mt-8 border-t border-ink-200/60 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-walnut-900 mb-4">
                {t('products.specifications')}
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {spec('woodType', t('products.woodType'))}
                {spec('finish', t('products.finish'))}
                {spec('thickness', t('products.thickness'))}
                {spec('plankSize', t('products.plankSize'))}
              </dl>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-ink-200/60" dir="ltr" lang="en">
            <p className="mb-4 text-xs text-ink-400">
              Product details are the same in every language.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || (!dirty && !isNew)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-walnut-800 py-4 text-base font-semibold tracking-wide text-sand-50 transition-all duration-300 hover:bg-walnut-700 hover:shadow-lift disabled:opacity-50 disabled:hover:shadow-none"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? 'Saving…' : isNew ? 'Add product' : 'Save product'}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={saving}
                className="rounded-full border border-walnut-800/25 px-6 py-4 text-sm font-medium text-walnut-800 transition-colors hover:bg-walnut-800/5"
              >
                Cancel
              </button>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => onDelete(original as ApiProduct)}
                  disabled={saving}
                  aria-label="Delete product"
                  title="Delete product"
                  className="flex items-center justify-center rounded-full border border-red-200 px-5 py-4 text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { t } = useLanguage();
  const { info, setField, isDirty, notify } = useAdmin();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [woodTypes, setWoodTypes] = useState<string[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const showPrice = info?.showPrice ?? true;

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'featured', label: t('products.sortFeatured') },
    { value: 'price-asc', label: t('products.sortPriceAsc') },
    { value: 'price-desc', label: t('products.sortPriceDesc') },
    { value: 'name-asc', label: t('products.sortNameAsc') },
  ];

  const openEditor = (product: Draft) => {
    setEditing(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(errorText(err, 'Error loading products')))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (saved: ApiProduct) => {
    setProducts((list) =>
      list.some((p) => p.id === saved.id)
        ? list.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...list],
    );
    setEditing(null);
  };

  const handleDelete = async (product: ApiProduct) => {
    const name = product.title || SITE_DEFAULTS.title;
    if (!window.confirm(`Delete "${name}"? This removes it from the website.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      setProducts((list) => list.filter((p) => p.id !== product.id));
      setEditing(null);
      notify('success', `Deleted "${name}"`);
    } catch (err) {
      notify('error', errorText(err, 'Failed to delete product'));
    }
  };

  const toggle = <T,>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    // The public site ignores the wood type and finish filters for now, so this does too
    let list = products;
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        list = [...list].sort((a, b) =>
          (a.title || SITE_DEFAULTS.title).localeCompare(b.title || SITE_DEFAULTS.title),
        );
        break;
      default:
        break;
    }
    return list;
  }, [products, sort]);

  const activeCount = woodTypes.length + finishes.length;
  const clearAll = () => {
    setWoodTypes([]);
    setFinishes([]);
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      {[
        {
          title: t('products.woodType'),
          options: WOOD_TYPES as string[],
          value: woodTypes,
          setter: setWoodTypes,
        },
        {
          title: t('products.finish'),
          options: FINISHES as string[],
          value: finishes,
          setter: setFinishes,
        },
      ].map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-walnut-900">
            {group.title}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {group.options.map((option) => {
              const active = group.value.includes(option);
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => toggle(group.value, option, group.setter)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-walnut-800/8 text-walnut-900'
                        : 'text-ink-600 hover:bg-ink-100/60'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                        active ? 'border-walnut-800 bg-walnut-800 text-sand-50' : 'border-ink-300'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                    </span>
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brass-700 hover:text-brass-800"
        >
          <X className="h-4 w-4" />
          {t('products.clearAllFilters')}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Page header */}
      <section className="bg-ink-950 pt-36 pb-20 text-sand-100 lg:pt-44 lg:pb-28">
        <div className="container-wide">
          <InfoText
            as="p"
            field="productsEyebrow"
            label="Products page eyebrow"
            fallback={t('products.pageEyebrow')}
            className="eyebrow block text-brass-300"
          />
          <InfoText
            as="h1"
            field="productsTitle"
            label="Products page title"
            fallback={t('products.pageTitle')}
            className="mt-4 block max-w-3xl font-display text-5xl font-700 leading-[1.05] text-sand-50 sm:text-6xl"
          />
          <InfoText
            as="p"
            field="productsDescription"
            label="Products page description"
            fallback={t('products.pageDescription')}
            multiline
            className="mt-6 block max-w-2xl text-lg leading-relaxed text-sand-100/70"
          />
        </div>
      </section>

      {/* Catalog */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          {editing ? (
            <ProductEditor
              key={editing.id ?? 'new'}
              original={editing}
              showPrice={showPrice}
              onClose={() => setEditing(null)}
              onSaved={handleSaved}
              onDelete={(p) => void handleDelete(p)}
            />
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
              {/* Desktop sidebar */}
              <aside className="hidden w-64 shrink-0 lg:block">
                <div className="sticky top-28">
                  <div className="mb-6 flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-walnut-800" />
                    <h2 className="font-display text-lg font-600 text-walnut-900">
                      {t('products.filters')}
                    </h2>
                  </div>
                  <FilterPanel />
                </div>
              </aside>

              {/* Main grid */}
              <div className="flex-1">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-walnut-800 hover:text-walnut-800 lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {t('products.filters')}
                    </button>
                    <p className="text-sm text-ink-500">
                      {filtered.length === 1
                        ? t('products.showingOne', { count: filtered.length })
                        : t('products.showingMany', { count: filtered.length })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setField('showPrice', !showPrice)}
                      aria-pressed={showPrice}
                      dir="ltr"
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                        isDirty('showPrice')
                          ? 'border-amber-400 ring-2 ring-amber-400'
                          : 'border-ink-200 hover:border-walnut-800'
                      } ${showPrice ? 'text-walnut-800' : 'text-ink-500'}`}
                    >
                      {showPrice ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {showPrice ? 'Prices shown' : 'Prices hidden'}
                    </button>
                    <ArrowUpDown className="h-4 w-4 text-ink-400" />
                    <label htmlFor="sort" className="sr-only">
                      {t('products.sortLabel')}
                    </label>
                    <select
                      id="sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors focus:border-walnut-500 focus:outline-none focus:ring-2 focus:ring-walnut-500/20"
                    >
                      {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-walnut-800 border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                    <p className="font-display text-lg font-600 text-red-600">
                      {t('products.loadError')}
                    </p>
                    <p className="mt-2 text-sm text-ink-500">{error}</p>
                  </div>
                ) : (
                  <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => openEditor({ price: 0 })}
                      dir="ltr"
                      className="flex min-h-[24rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-walnut-800/25 bg-white/50 text-walnut-800 transition-colors hover:border-walnut-800 hover:bg-white"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-walnut-800 text-sand-50 shadow-card">
                        <Plus className="h-6 w-6" />
                      </span>
                      <span className="font-display text-lg font-600">Add product</span>
                    </button>
                    {filtered.map((p, i) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        index={i}
                        showPrice={showPrice}
                        onEdit={openEditor}
                        onDelete={(product) => void handleDelete(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-sand-50 p-6 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-600 text-walnut-900">
                {t('products.filters')}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label={t('products.closeFilters')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-700 hover:bg-ink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full btn-primary"
            >
              {t('products.showResults', { count: filtered.length })}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
