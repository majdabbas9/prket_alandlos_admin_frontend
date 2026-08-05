import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, TreePine } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
const LOGO_URL = `${SERVER_URL}/api/logo`;

const NAV_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Manage Products', to: '/products' },
  { label: 'Manage Info', to: '/info' },
  { label: 'Manage Logo', to: '/logo' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
        scrolled
          ? 'bg-sand-50/90 shadow-soft backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-wide flex h-20 items-center justify-between">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5"
        >
          <span
            className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-colors duration-300 ${
              scrolled
                ? 'border-walnut-800/20 bg-walnut-800 text-sand-50'
                : 'border-white/30 bg-white/10 text-sand-50 backdrop-blur-sm'
            }`}
          >
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
          <span
            className={`font-display text-xl font-700 tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-walnut-900' : 'text-sand-50'
            }`}
          >
            Prket Alandlos Admin
          </span>
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-current after:transition-all after:duration-300 ${
                    isActive
                      ? 'after:w-full'
                      : 'after:w-0 hover:after:w-full'
                  } ${scrolled ? 'text-ink-700 hover:text-walnut-800' : 'text-sand-50/90 hover:text-sand-50'}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>



        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
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
          {NAV_LINKS.map((link) => (
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

        </ul>
      </div>
    </header>
  );
}
