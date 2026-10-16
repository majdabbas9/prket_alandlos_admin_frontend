import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, TreePine } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LANGS } from '@/i18n/translations';
import { useAdmin } from '@/admin/context';
import { ImageButton } from '@/admin/Editable';

function LangPills({ variant }: { variant: 'light' | 'dark' }) {
  const { lang } = useLanguage();
  const { switchLang } = useAdmin();
  const active = variant === 'light' ? 'bg-sand-50 text-ink-950' : 'bg-walnut-800 text-sand-50';
  const inactive =
    variant === 'light'
      ? 'text-sand-50/80 hover:bg-white/10'
      : 'text-ink-600 hover:bg-walnut-800/10';
  const container = variant === 'light' ? 'border-sand-50/30' : 'border-ink-200';

  return (
    <div className={`flex items-center gap-1 rounded-full border p-1 ${container}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => switchLang(l.code)}
          aria-label={l.label}
          aria-pressed={lang === l.code}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-300 ${
            lang === l.code ? active : inactive
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

export function SiteLogo({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  const { imageUrl } = useAdmin();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [imageUrl.logo]);

  return (
    <span
      className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border ${className}`}
    >
      {failed ? (
        <TreePine className="h-5 w-5" />
      ) : (
        <img
          src={imageUrl.logo}
          alt={t('nav.logoAlt')}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

/** Logo plus a small pencil button that uploads a new one */
export function EditableLogo({ className = '' }: { className?: string }) {
  const { uploadImage, uploading } = useAdmin();
  return (
    <span className="relative shrink-0">
      <SiteLogo className={className} />
      <ImageButton
        compact
        label="Change logo"
        busy={uploading.logo}
        onFile={(f) => void uploadImage('logo', f)}
        className="absolute -bottom-1 -end-1"
      />
    </span>
  );
}

export default function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.products'), to: '/products' },
    { label: t('nav.contact'), to: '/contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-sand-50/90 shadow-soft backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="container-wide flex h-20 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <EditableLogo
            className={`transition-colors duration-300 ${
              scrolled
                ? 'border-walnut-800/20 bg-walnut-800 text-sand-50'
                : 'border-white/30 bg-white/10 text-sand-50 backdrop-blur-sm'
            }`}
          />
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className={`font-display text-xl font-700 tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-walnut-900' : 'text-sand-50'
            }`}
          >
            Prket Alandlos
          </Link>
        </div>

        <div className="hidden items-center gap-9 md:flex">
          <ul className="flex items-center gap-9">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `relative text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:-bottom-1.5 after:start-0 after:h-px after:bg-current after:transition-all after:duration-300 ${
                      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                    } ${scrolled ? 'text-ink-700 hover:text-walnut-800' : 'text-sand-50/90 hover:text-sand-50'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <LangPills variant={scrolled ? 'dark' : 'light'} />
        </div>

        <Link to="/products" className="hidden md:inline-flex btn-primary !py-2.5 !px-6">
          {t('nav.explore')}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t('nav.toggleMenu')}
          aria-expanded={open}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 md:hidden ${
            scrolled ? 'text-walnut-900 hover:bg-walnut-800/10' : 'text-sand-50 hover:bg-white/10'
          }`}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden bg-sand-50 transition-all duration-400 ease-out ${
          open ? 'max-h-[28rem] border-t border-ink-200/60 shadow-card' : 'max-h-0'
        }`}
      >
        <ul className="container-wide flex flex-col gap-1 py-5">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-walnut-800 text-sand-50'
                      : 'text-ink-700 hover:bg-walnut-800/5 hover:text-walnut-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li className="mt-2 flex justify-center">
            <LangPills variant="dark" />
          </li>
          <li className="mt-2">
            <Link to="/products" onClick={() => setOpen(false)} className="btn-primary w-full">
              {t('nav.explore')}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
