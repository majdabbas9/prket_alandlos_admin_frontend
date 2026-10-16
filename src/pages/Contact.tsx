import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { parseOpeningTime } from '@/hooks/useInfo';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdmin } from '@/admin/context';
import { InfoText, OpeningHoursText } from '@/admin/Editable';

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

const CARD =
  'group flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-walnut-800/30 hover:shadow-card';
const CARD_ICON =
  'flex h-12 w-12 items-center justify-center rounded-xl bg-walnut-800/8 text-walnut-800 transition-colors group-hover:bg-walnut-800 group-hover:text-sand-50';
const CARD_TITLE = 'mt-5 font-display text-xl font-600 text-walnut-900';
const CARD_LINE = 'mt-1 block text-sm leading-relaxed text-ink-500';

export default function Contact() {
  const { t } = useLanguage();
  const { info } = useAdmin();
  const parsedHours = info ? parseOpeningTime(info.storeOpeningTime) : null;
  const location = info?.location || 'kafr kanna, Isreal';

  return (
    <>
      {/* Header */}
      <section className="bg-ink-950 pt-36 pb-20 text-sand-100 lg:pt-44 lg:pb-28">
        <div className="container-wide">
          <InfoText
            as="p"
            field="contactEyebrow"
            label="Contact eyebrow"
            fallback={t('contact.fallbackEyebrow')}
            className="eyebrow block text-brass-300"
          />
          <InfoText
            as="h1"
            field="contactTitle"
            label="Contact title"
            fallback={t('contact.fallbackTitle')}
            className="mt-4 block max-w-3xl font-display text-5xl font-700 leading-[1.05] text-sand-50 sm:text-6xl"
          />
          <InfoText
            as="p"
            field="contactDescription"
            label="Contact description"
            fallback={t('contact.fallbackDescription')}
            multiline
            className="mt-6 block max-w-2xl text-lg leading-relaxed text-sand-100/70"
          />
        </div>
      </section>

      {/* Contact cards — the site links these; here their text is editable instead */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-3">
            <Reveal>
              <div className={CARD}>
                <span className={CARD_ICON}>
                  <Phone className="h-6 w-6" />
                </span>
                <h3 className={CARD_TITLE}>{t('contact.callUs')}</h3>
                <InfoText
                  as="p"
                  field="phone"
                  label="Phone (all languages)"
                  fallback="053-3919190"
                  dir="ltr"
                  inputMode="tel"
                  className={CARD_LINE}
                />
                <p className={CARD_LINE}>
                  {parsedHours?.days
                    ? [parsedHours.days, parsedHours.time].filter(Boolean).join(', ')
                    : t('contact.fallbackHours')}
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className={CARD}>
                <span className={CARD_ICON}>
                  <MessageCircle className="h-6 w-6" />
                </span>
                <h3 className={CARD_TITLE}>{t('contact.whatsappUs')}</h3>
                <InfoText
                  as="p"
                  field="whatsappLink"
                  label="WhatsApp link (all languages)"
                  fallback="wa.me/+972533919190"
                  dir="ltr"
                  className={CARD_LINE}
                />
                <p className={CARD_LINE}>{t('contact.clickToChat')}</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className={CARD}>
                <span className={CARD_ICON}>
                  <MapPin className="h-6 w-6" />
                </span>
                <h3 className={CARD_TITLE}>{t('contact.visitShowroom')}</h3>
                <InfoText
                  as="p"
                  field="location"
                  label="Address"
                  fallback="kafr kanna, Isreal"
                  className={CARD_LINE}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Store hours & location */}
      <section className="pb-24 lg:pb-32">
        <div className="container-wide">
          <Reveal>
            <div id="location" className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-soft">
                  <h3 className="flex items-center gap-2 font-display text-2xl font-700 text-walnut-900">
                    <Clock className="h-6 w-6 text-brass-500" />
                    {t('contact.storeHours')}
                  </h3>
                  <ul className="mt-5 divide-y divide-ink-100">
                    <li className="flex flex-col gap-1 py-3 justify-center">
                      <OpeningHoursText
                        daysClassName="text-sm text-ink-600 font-semibold"
                        timeClassName="text-sm font-medium text-walnut-900"
                      />
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-soft">
                  <h3 className="flex items-center gap-2 font-display text-2xl font-700 text-walnut-900">
                    <MapPin className="h-6 w-6 text-brass-500" />
                    {t('contact.howToFindUs')}
                  </h3>
                  <InfoText
                    as="p"
                    field="location"
                    label="Address"
                    fallback="kafr kanna, Isreal"
                    className="mt-4 block text-sm leading-relaxed text-ink-600"
                  />
                </div>
              </div>

              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border border-ink-200/70 shadow-soft h-full flex flex-col justify-between">
                <div className="relative flex-1 min-h-[300px] bg-gradient-to-br from-sand-200 to-sand-300">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(122,90,46,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(122,90,46,0.12) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-walnut-800 text-sand-50 shadow-card">
                      <MapPin className="h-6 w-6" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-walnut-900 font-display">
                      {t('home.showroomName')}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">{location}</p>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-walnut-800 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sand-50 transition-all duration-300 hover:bg-walnut-700 hover:scale-105 active:scale-95 shadow-sm"
                      >
                        {t('home.googleMaps')}
                      </a>
                      <a
                        href={`https://waze.com/ul?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}&navigate=yes`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-sky-400 hover:scale-105 active:scale-95 shadow-sm"
                      >
                        {t('home.waze')}
                      </a>
                    </div>
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
