import { Link } from 'react-router-dom';
import { TreePine, Instagram, Facebook, Twitter, MapPin, Clock, Mail, Phone, MessageCircle } from 'lucide-react';
import { useInfo, parseOpeningTime } from '@/hooks/useInfo';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
const LOGO_URL = `${SERVER_URL}/api/logo`;

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Contact Us', to: '/contact' },
];

const HOURS = [
  { day: 'Sunday — Thursday', time: '9:00 AM — 7:00 PM' },
  { day: 'Friday — Saturday', time: '10:00 AM — 9:00 PM' },
];

export default function Footer() {
  const { info } = useInfo();
  const parsedHours = info ? parseOpeningTime(info.storeOpeningTime) : null;

  const whatsappUrl = info?.whatsappLink ? (info.whatsappLink.startsWith('http') ? info.whatsappLink : `https://${info.whatsappLink}`) : '#';

  const socialLinks = [
    { Icon: Instagram, href: 'https://www.instagram.com/prket_alandlos/', label: 'Instagram' },
    ...(info?.whatsappLink ? [{ Icon: MessageCircle, href: whatsappUrl, label: 'WhatsApp' }] : []),
  ];

  return (
    <footer className="bg-ink-950 text-sand-100">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-sand-100/20 bg-walnut-800 text-sand-50">
              <img
                src={LOGO_URL}
                alt="Prket Alandlos Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.logo-fallback');
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <span className="logo-fallback hidden h-full w-full items-center justify-center">
                <TreePine className="h-5 w-5" />
              </span>
            </span>
            <span className="font-display text-xl font-700 text-sand-50">Prket Alandlos</span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand-100/70">
            {info?.description ||
              'Premium wood flooring, crafted with patience. Sustainably sourced hardwoods finished by hand for floors that last generations.'}
          </p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map(({ Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                target={href !== '#' ? '_blank' : undefined}
                rel={href !== '#' ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-100/15 text-sand-100/80 transition-all duration-300 hover:border-brass-400 hover:bg-brass-400 hover:text-ink-950"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sand-50">Quick Links</h3>
          <ul className="mt-5 space-y-3">
            {QUICK_LINKS.map((link) => (
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
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sand-50">Visit Us</h3>
          <ul className="mt-5 space-y-4 text-sm text-sand-100/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brass-400" />
              <span>{info?.location || 'kafr kanna, Isreal'}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brass-400" />
              <a href={`tel:${info?.phone || '053-3919190'}`} className="hover:text-brass-300">
                {info?.phone || '053-3919190'}
              </a>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brass-400" />
              <a href={whatsappUrl} className="hover:text-brass-300">
                {info?.whatsappLink || 'wa.me/+972533919190'}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-sand-50">
            <Clock className="h-4 w-4 text-brass-400" />
            Opening Hours
          </h3>
          <ul className="mt-5 space-y-3">
            {parsedHours ? (
              <li className="text-sm">
                <p className="text-sand-100/90">{parsedHours.days}</p>
                <p className="text-sand-100/60">{parsedHours.time}</p>
              </li>
            ) : (
              HOURS.map((h) => (
                <li key={h.day} className="text-sm">
                  <p className="text-sand-100/90">{h.day}</p>
                  <p className="text-sand-100/60">{h.time}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-sand-100/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-6 text-xs text-sand-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Prket Alandlos. All rights reserved.</p>
          <p>Crafted with care for floors that tell a story.</p>
        </div>
      </div>
    </footer>
  );
}
