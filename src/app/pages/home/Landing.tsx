import { Link } from 'react-router';

const features = [
  {
    title: 'For HR Leaders',
    description: 'Enable a culture of goal ownership, transparency, and fair performance cycles across every hierarchy.',
  },
  {
    title: 'For Managers',
    description: 'Coach teams with a clear line of sight into progress, goal health, and actionable insights.',
  },
  {
    title: 'For Employees',
    description: 'Own outcomes with easy goal sheets, shared objectives, and continuous feedback tracking.',
  },
];

const trusted = [
  'Aethelred Tech',
  'Synapse Solutions',
  'Apex Analytics',
  'Zenith Systems',
  'Northbridge Labs',
  'SummitCloud',
];

export default function Landing() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-900 to-[#1c2f53] px-6 py-12 text-white md:px-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Performance OS</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
              Empower Your Teams with Purpose.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
              Goal setting. Performance. Growth. A unified platform for excellence that aligns strategy,
              coaching, and execution in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-full bg-[#1976d2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-[#1565c0]"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60"
              >
                Book a Demo
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-2xl bg-[#1976d2]/80 blur-[2px]" />
            <div className="absolute -bottom-8 left-4 h-24 w-24 rounded-3xl border border-white/20 bg-white/10" />
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-white/5 md:h-72 md:w-72">
              <div className="flex h-44 w-44 items-center justify-center rounded-full border border-white/40">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/60">
                  <div className="h-14 w-14 rounded-full border-4 border-white/80" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 right-6 rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-white/80">
              Alignment Score 92%
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 h-10 w-10 rounded-xl bg-[#1976d2]/10" />
            <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Aneesh Kohen</p>
              <p className="text-xs text-slate-500">People Research, Penthynm</p>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-slate-600">
            “The visibility layer has transformed how we evaluate performance and coach teams.
            The platform keeps every department focused and accountable in a single flow.”
          </p>
        </div>
      </section>

      <section id="admins" className="mt-12 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">A Platform Admins Love</h2>
          <p className="mt-3 text-sm text-slate-600">
            Gain complete visibility into goal cycles, readiness, and compliance. Configure
            performance windows, approvals, and org hierarchy from one secure admin hub.
          </p>
          <div className="mt-6 grid gap-3">
            {['Cycle orchestration & approvals', 'Custom governance & audit logs', 'Org-wide analytics dashboards'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-[#1976d2]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 h-4 w-24 rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-28 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
          </div>
        </div>
      </section>

      <section id="trusted" className="mt-14">
        <h3 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Trusted By
        </h3>
        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-600 sm:grid-cols-2 md:grid-cols-3">
          {trusted.map((company) => (
            <div key={company} className="rounded-xl bg-slate-50 px-4 py-3">
              {company}
            </div>
          ))}
        </div>
      </section>

      <section id="resources" className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#1976d2] px-6 py-8 text-white shadow-lg shadow-blue-900/20">
          <h4 className="text-lg font-semibold">Start Your Trial</h4>
          <p className="mt-2 text-sm text-white/80">
            Deliver enterprise-grade goal alignment for every team with one unified portal.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1976d2] transition hover:bg-slate-100"
          >
            Get Started
          </Link>
        </div>
        <div className="rounded-2xl bg-slate-900 px-6 py-8 text-white">
          <h4 className="text-lg font-semibold">Download Case Studies</h4>
          <p className="mt-2 text-sm text-white/70">
            See how top-performing teams accelerate performance cycles with Pheonix.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-flex rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60"
          >
            Download
          </Link>
        </div>
      </section>
    </div>
  );
}
