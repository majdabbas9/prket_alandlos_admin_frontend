import { Link } from 'react-router-dom';
import { Instagram, MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdmin } from '@/admin/context';
import { InfoText, OpeningHoursText } from '@/admin/Editable';
import { EditableLogo } from '@/components/Navbar';

export default function Footer() {
  const { t } = useLanguage();
  const { info } = useAdmin();

  const quickLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.products'), to: '/products' },
    { label: t('nav.contact'), to: '/contact' },
  ];

  const socialLinks = [
    {
      Icon: Instagram,
      href: 'https://www.instagram.com/prket_alandlos/',
      label: t('footer.instagram'),
    },
    // The site shows the WhatsApp button only while a link is set
    ...(info?.whatsappLink ? [{ Icon: MessageCircle, href: '', label: t('footer.whatsapp') }] : []),
  ];

  return (
    <footer className="bg-ink-950 text-sand-100">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <EditableLogo className="border-sand-100/20 bg-walnut-800 text-sand-50" />
            <Link to="/" className="font-display text-xl font-700 text-sand-50">
              Prket Alandlos
            </Link>
          </div>
          <InfoText
            as="p"
            field="description"
            label="Footer description"
            fallback={t('footer.fallbackDescription')}
            multiline
            className="mt-5 block max-w-xs text-sm leading-relaxed text-sand-100/70"
          />
          <div className="mt-6 flex gap-3">
            {socialLinks.map(({ Icon, href, label }, i) => (
              <a
                key={i}
                href={href || undefined}
                target={href ? '_blank' : undefined}
                rel={href ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-100/15 text-sand-100/80 transition-all duration-300 hover:border-brass-400 hover:bg-brass-400 hover:text-ink-950"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sand-50">
            {t('footer.quickLinks')}
          </h3>
          <ul className="mt-5 space-y-3">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-sand-100/70 transition-colors hover:text-brass-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sand-50">
            {t('footer.visitUs')}
          </h3>
          <ul className="mt-5 space-y-4 text-sm text-sand-100/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brass-400" />
              <InfoText field="location" label="Address" fallback="kafr kanna, Isreal" />
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brass-400" />
              <InfoText
                field="phone"
                label="Phone (all languages)"
                fallback="053-3919190"
                dir="ltr"
                inputMode="tel"
              />
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brass-400" />
              <InfoText
                field="whatsappLink"
                label="WhatsApp link (all languages)"
                fallback="wa.me/+972533919190"
                dir="ltr"
              />
            </li>
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-sand-50">
            <Clock className="h-4 w-4 text-brass-400" />
            {t('footer.openingHours')}
          </h3>
          <ul className="mt-5 space-y-3">
            <li className="text-sm">
              <OpeningHoursText
                daysAs="p"
                timeAs="p"
                daysClassName="text-sand-100/90"
                timeClassName="text-sand-100/60"
              />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sand-100/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-6 text-xs text-sand-100/50 sm:flex-row">
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <p>{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  );
}
