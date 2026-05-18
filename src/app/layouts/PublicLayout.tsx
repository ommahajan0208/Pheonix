import { Link, Outlet } from 'react-router';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
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
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:px-6">
          <div>
            <div className="font-semibold text-slate-700">Pheonix</div>
            <div>Empower teams with purpose.</div>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#features" className="transition hover:text-slate-700">Features</a>
            <a href="#admins" className="transition hover:text-slate-700">Admins</a>
            <a href="#trusted" className="transition hover:text-slate-700">Customers</a>
            <Link to="/login" className="transition hover:text-slate-700">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
