import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router';

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header
        className={`sticky top-0 z-40 border-b border-transparent transition-all duration-300 ${
          scrolled ? 'bg-white/80 shadow-sm backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1976d2] text-sm font-bold text-white">
              P
            </div>
            <div>
              <div className="text-lg font-bold">Pheonix</div>
              <div className="text-xs text-slate-500">Performance OS</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-900">Features</a>
            <a href="#admins" className="transition hover:text-slate-900">For Admins</a>
            <a href="#trusted" className="transition hover:text-slate-900">Trusted By</a>
            <a href="#resources" className="transition hover:text-slate-900">Resources</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-slate-600 transition hover:text-slate-900 md:inline-flex">
              Sign In
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-[#1976d2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1565c0]"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 text-sm text-slate-500 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] md:px-6">
          <div>
            <div className="font-semibold text-slate-700">Pheonix</div>
            <div>Empower teams with purpose.</div>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
              <span className="rounded-full border border-slate-200 px-2 py-1">SOC 2 Ready</span>
              <span className="rounded-full border border-slate-200 px-2 py-1">GDPR</span>
              <span className="rounded-full border border-slate-200 px-2 py-1">SSO</span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Product</p>
            <div className="grid gap-2">
              <a href="#features" className="transition hover:text-slate-700">Features</a>
              <a href="#admins" className="transition hover:text-slate-700">Admins</a>
              <a href="#trusted" className="transition hover:text-slate-700">Customers</a>
              <Link to="/login" className="transition hover:text-slate-700">Login</Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Solutions</p>
            <div className="grid gap-2">
              <a href="#resources" className="transition hover:text-slate-700">Performance Cycles</a>
              <a href="#resources" className="transition hover:text-slate-700">Goal Alignment</a>
              <a href="#resources" className="transition hover:text-slate-700">Analytics Hub</a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Resources</p>
            <div className="grid gap-2">
              <a href="#resources" className="transition hover:text-slate-700">Case Studies</a>
              <a href="#resources" className="transition hover:text-slate-700">Guides</a>
              <a href="#resources" className="transition hover:text-slate-700">Security</a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Company</p>
            <div className="grid gap-2">
              <a href="#features" className="transition hover:text-slate-700">About</a>
              <a href="#resources" className="transition hover:text-slate-700">Contact</a>
              <div className="pt-2 text-xs">
                <a href="#features" className="mr-3 transition hover:text-slate-700">Privacy</a>
                <a href="#features" className="mr-3 transition hover:text-slate-700">Terms</a>
                <a href="#resources" className="transition hover:text-slate-700">Security</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-3 px-4 py-4 text-xs text-slate-400 md:flex-row md:items-center md:px-6">
            <span>© {new Date().getFullYear()} Pheonix. All rights reserved.</span>
            <div className="flex gap-3">
              <a href="#resources" className="transition hover:text-slate-600">LinkedIn</a>
              <a href="#resources" className="transition hover:text-slate-600">X</a>
              <a href="#resources" className="transition hover:text-slate-600">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
