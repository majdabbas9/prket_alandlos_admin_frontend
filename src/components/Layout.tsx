import { Outlet } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AdminBar from '@/admin/AdminBar';
import { useAdmin } from '@/admin/context';

export default function Layout() {
  const { info, loadError } = useAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      {info ? (
        <>
          <main className="flex-1">
            <Outlet />
          </main>
          {/* Bottom padding keeps the footer clear of the floating admin bar */}
          <div className="bg-ink-950 pb-20">
            <Footer />
          </div>
        </>
      ) : (
        <main className="flex flex-1 items-center justify-center bg-ink-950 px-5 text-center">
          {loadError ? (
            <div className="max-w-md text-sand-100">
              <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
              <p className="mt-4 font-display text-xl font-600">Could not load the site content</p>
              <p className="mt-2 text-sm text-sand-100/60">{loadError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary mt-6"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brass-400 border-t-transparent" />
          )}
        </main>
      )}
      <AdminBar />
    </div>
  );
}
