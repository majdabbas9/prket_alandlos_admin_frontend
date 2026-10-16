import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Car } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdmin } from '@/admin/context';
import { EditableText, ImageButton, InfoText, OpeningHoursText } from '@/admin/Editable';
import type { Stat } from '@/hooks/useInfo';

const DEFAULT_STATS = [
  { value: '30+', labelKey: 'home.statsYears' as const },
  { value: '1,200', labelKey: 'home.statsFloors' as const },
  { value: '9', labelKey: 'home.statsCollections' as const },
  { value: '4.9', labelKey: 'home.statsRating' as const },
];

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const { info, setField, isDirty, imageUrl, uploading, uploadImage } = useAdmin();
  const stats: Stat[] =
    info?.stats && info.stats.length > 0
      ? info.stats
      : DEFAULT_STATS.map((s) => ({ value: s.value, label: t(s.labelKey) }));
  const setStat = (index: number, key: keyof Stat, value: string) =>
    setField(
      'stats',
      stats.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    );
  const location = info?.location || 'kafr kanna, Isreal';

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={imageUrl.hero}
            alt={t('home.heroImgAlt')}
            className="h-full w-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/55 to-ink-950/20 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
        </div>

        {/* On the open part of the photo, across from the hero text */}
        <div className="absolute end-5 top-24 z-20 sm:end-12 sm:top-1/2 sm:-translate-y-1/2 lg:end-[12%]">
          <ImageButton
            accent
            label={t('admin.editImage')}
            busy={uploading.hero}
            onFile={(f) => void uploadImage('hero', f)}
          />
        </div>

        <div className="container-wide relative z-10 pt-28">
          <div className="max-w-2xl">
            <InfoText
              as="p"
              field="heroEyebrow"
              label="Hero eyebrow"
              fallback={t('home.fallbackHeroEyebrow')}
              className="eyebrow block animate-fade-up text-brass-300"
            />
            <InfoText
              as="h1"
              field="heroTitle"
              label="Hero title"
              fallback={t('home.fallbackHeroTitle')}
              multiline
              className="mt-5 block font-display text-5xl font-700 leading-[1.05] text-sand-50 animate-fade-up sm:text-6xl lg:text-7xl whitespace-pre-line"
            />
            <InfoText
              as="p"
              field="heroDescription"
              label="Hero description"
              fallback={t('home.fallbackHeroDescription')}
              multiline
              className="mt-6 block max-w-xl text-lg leading-relaxed text-sand-100/85 animate-fade-up"
            />
            <div className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up">
              <Link to="/products" className="btn-primary group">
                {t('home.exploreCollection')}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sand-50/30 px-7 py-3.5 text-sm font-medium tracking-wide text-sand-50 transition-all duration-300 hover:border-sand-50 hover:bg-sand-50/10"
              >
                {t('home.visitShowroom')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container-wide pb-10">
            <div className="hidden gap-10 rounded-2xl border border-sand-50/15 bg-ink-950/30 px-8 py-6 backdrop-blur-md sm:grid sm:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i}>
                  <EditableText
                    as="p"
                    value={s.value}
                    onChange={(v) => setStat(i, 'value', v)}
                    label={`Stat ${i + 1} value`}
                    dirty={isDirty('stats')}
                    className="block font-display text-3xl font-700 text-sand-50"
                  />
                  <EditableText
                    as="p"
                    value={s.label}
                    onChange={(v) => setStat(i, 'label', v)}
                    label={`Stat ${i + 1} label`}
                    dirty={isDirty('stats')}
                    className="mt-1 block text-xs uppercase tracking-[0.16em] text-sand-100/70"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us / Location */}
      <section className="bg-ink-950 py-24 text-sand-100 lg:py-32">
        <div className="container-wide">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <InfoText
                as="p"
                field="showroomEyebrow"
                label="Showroom eyebrow"
                fallback={t('home.fallbackShowroomEyebrow')}
                className="eyebrow block text-brass-300"
              />
              <InfoText
                as="h2"
                field="showroomTitle"
                label="Showroom title"
                fallback={t('home.fallbackShowroomTitle')}
                className="mt-4 block font-display text-4xl font-700 text-sand-50 sm:text-5xl"
              />
              <InfoText
                as="p"
                field="showroomDescription"
                label="Showroom description"
                fallback={t('home.fallbackShowroomDescription')}
                multiline
                className="mt-5 block text-lg leading-relaxed text-sand-100/70"
              />
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <Reveal>
              <div className="h-full rounded-2xl border border-sand-100/10 bg-sand-100/5 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-brass-400/40 hover:bg-sand-100/10">
                <MapPin className="h-7 w-7 text-brass-400" />
                <h3 className="mt-5 font-display text-xl font-600 text-sand-50">
                  {t('home.ourAddress')}
                </h3>
                <InfoText
                  as="p"
                  field="location"
                  label="Address"
                  fallback="kafr kanna, Isreal"
                  className="mt-3 block text-sm leading-relaxed text-sand-100/70"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-2xl border border-sand-100/10 bg-sand-100/5 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-brass-400/40 hover:bg-sand-100/10">
                <Clock className="h-7 w-7 text-brass-400" />
                <h3 className="mt-5 font-display text-xl font-600 text-sand-50">
                  {t('home.openingHours')}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-sand-100/70">
                  <li>
                    <OpeningHoursText
                      daysAs="div"
                      timeAs="div"
                      timeClassName="mt-0.5 text-xs text-sand-100/50"
                    />
                  </li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="h-full rounded-2xl border border-sand-100/10 bg-sand-100/5 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-brass-400/40 hover:bg-sand-100/10">
                <Car className="h-7 w-7 text-brass-400" />
                <h3 className="mt-5 font-display text-xl font-600 text-sand-50">
                  {t('home.gettingHere')}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-sand-100/70">
                  {t('home.gettingHereText', { location: location.split(',')[0] })}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Map placeholder */}
          <Reveal delay={120}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-sand-100/10 shadow-card">
              <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-ink-900 to-walnut-900">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(214,190,138,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(214,190,138,0.15) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-400 text-ink-950 shadow-lift">
                    <MapPin className="h-7 w-7" />
                  </span>
                  <p className="mt-4 font-display text-lg font-600 text-sand-50">
                    {t('home.showroomName')}
                  </p>
                  <p className="mt-1 text-sm text-sand-100/60">{location}</p>

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-brass-400 px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink-950 transition-all duration-300 hover:bg-brass-300 hover:scale-105 active:scale-95 shadow-md"
                    >
                      {t('home.googleMaps')}
                    </a>
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-sky-400 hover:scale-105 active:scale-95 shadow-md"
                    >
                      {t('home.waze')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
