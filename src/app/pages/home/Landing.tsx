import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Building2, CheckSquare, MessageSquare, ShieldCheck, Target, TrendingUp } from 'lucide-react';

const heroSlides = [
  {
    title: 'Employee Dashboard',
    image: new URL('../../../../docs/images/Screenshot 2026-05-17 105756.png', import.meta.url).href,
  },
  {
    title: 'Manager Analytics',
    image: new URL('../../../../docs/images/Screenshot 2026-05-17 105918.png', import.meta.url).href,
  },
  {
    title: 'Admin Overview',
    image: new URL('../../../../docs/images/Screenshot 2026-05-17 110047.png', import.meta.url).href,
  },
];

const trusted = ['Aethelred Tech', 'Synapse Solutions', 'Apex Analytics', 'Zenith Systems', 'Northbridge Labs', 'SummitCloud'];

const processSteps = [
  {
    title: 'Set Goals',
    description: 'Create aligned company and team objectives with weightage guidance.',
    icon: Target,
  },
  {
    title: 'Track Progress',
    description: 'Monitor execution with real-time visibility and health indicators.',
    icon: TrendingUp,
  },
  {
    title: 'Run Reviews',
    description: 'Automate feedback cycles and performance discussions at scale.',
    icon: MessageSquare,
  },
];

const features = [
  {
    title: 'Improve Performance Visibility',
    description: 'Unify cycle timelines, accountability, and goal health across every department.',
    icon: Building2,
  },
  {
    title: 'Coach Teams More Effectively',
    description: 'Surface blockers early and guide team execution with real-time coaching signals.',
    icon: TrendingUp,
  },
  {
    title: 'Own Your Outcomes',
    description: 'Give every employee shared objectives, clear priorities, and progress transparency.',
    icon: CheckSquare,
  },
];

const metrics = [
  { value: 2, suffix: 'M+', label: 'goals tracked' },
  { value: 98, suffix: '%', label: 'review completion' },
  { value: 500, suffix: '+', label: 'organizations' },
  { value: 35, suffix: '%', label: 'faster performance cycles' },
];

export default function Landing() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [metricValues, setMetricValues] = useState(metrics.map(() => 0));
  const [metricsVisible, setMetricsVisible] = useState(false);
  const metricsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = metricsRef.current;
    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMetricsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!metricsVisible) {
      return;
    }
    let frameId = 0;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setMetricValues(metrics.map((metric) => Math.round(metric.value * progress)));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };
    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [metricsVisible]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-900 to-[#1c2f53] px-6 py-12 text-white md:px-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="animate-in fade-in slide-in-from-left-6 duration-700">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Performance OS</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
              Replace scattered spreadsheets with one unified performance OS.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/75 md:text-lg">
              Goal setting. Performance. Growth. Built for high-growth teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-full bg-[#1976d2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-[#1565c0]"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60"
              >
                Watch Product Tour
              </Link>
            </div>
            <p className="mt-3 text-xs font-medium text-white/60">No credit card required · Setup in 5 minutes</p>
          </div>
          <div className="relative animate-in fade-in slide-in-from-right-6 delay-150 duration-700">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-2xl bg-[#1976d2]/80 blur-[2px]" />
            <div className="absolute -bottom-8 left-2 h-24 w-24 rounded-3xl border border-white/20 bg-white/10" />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3 shadow-xl shadow-slate-950/35">
              <div className="relative h-[260px] overflow-hidden rounded-xl border border-white/10 bg-slate-950/30 md:h-[300px]">
                {heroSlides.map((slide, index) => (
                  <img
                    key={slide.title}
                    src={slide.image}
                    alt={slide.title}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                      index === activeSlide ? 'scale-100 opacity-100' : 'pointer-events-none scale-105 opacity-0'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">{heroSlides[activeSlide].title}</span>
                <div className="flex gap-2">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      aria-label={`Go to ${slide.title}`}
                      className={`h-2.5 w-2.5 rounded-full transition ${index === activeSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 right-4 rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold text-white/85">
              Alignment Score 92%
            </div>
          </div>
        </div>
      </section>

      <section id="trusted" className="mt-10 rounded-2xl border border-slate-200/70 bg-white px-4 py-8 sm:px-6">
        <h3 className="text-center text-xs font-medium uppercase tracking-[0.25em] text-slate-400">Trusted by</h3>
        <div className="mt-6 grid gap-6 text-center text-sm font-semibold text-slate-500 sm:grid-cols-3 md:grid-cols-6 md:gap-8">
          {trusted.map((company) => (
            <div key={company}>{company}</div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-slate-50 px-6 py-10 md:px-8">
        <h2 className="text-center text-2xl font-semibold text-slate-900">How Phoenix Works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1976d2]/10 text-sm font-semibold text-[#1976d2]">
                  {index + 1}
                </div>
                <step.icon className="h-5 w-5 text-[#1976d2]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              {index < processSteps.length - 1 && (
                <ArrowRight className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mt-12 rounded-3xl bg-white px-6 py-8 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="mb-4 inline-flex rounded-xl bg-[#1976d2]/10 p-2.5 text-[#1976d2] transition-colors group-hover:bg-[#1976d2]/15">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-[#1976d2]">
              AK
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Aneesh Kohen</p>
              <p className="text-xs text-slate-500">People Research Lead</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-200 text-[10px] font-semibold text-slate-600">
                  P
                </span>
                <span>Penthynm</span>
              </div>
              <p className="mt-1 inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1976d2] shadow-sm">
                ↓ 40% cycle time
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-slate-700">
            “We reduced review cycle time by 40% while improving manager participation and team engagement scores.
            The visibility layer transformed how every team tracks goals and accountability.”
          </p>
        </div>
      </section>

      <section id="admins" className="mt-12 grid gap-8 rounded-3xl bg-white p-6 md:grid-cols-[1.05fr_1fr] md:items-center md:p-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">A Platform Admins Love</h2>
          <p className="mt-3 text-sm text-slate-600">
            Gain complete visibility into goal cycles, readiness, and compliance. Configure performance windows,
            approvals, and org hierarchy from one secure admin hub.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              'Automate review cycles in minutes',
              'Track every approval and change',
              'Get org-wide visibility instantly',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <ShieldCheck className="h-4 w-4 text-[#1976d2]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <img
            src={new URL('../../../../docs/images/Screenshot 2026-05-17 110047.png', import.meta.url).href}
            alt="Phoenix admin dashboard"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section ref={metricsRef} className="mt-12 rounded-3xl bg-slate-900 px-6 py-10 text-white md:px-8">
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <div className="text-3xl font-semibold text-[#6fb2ff]">
                {metricValues[index]}
                {metric.suffix}
              </div>
              <p className="mt-1 text-sm text-white/75">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="resources" className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-r from-[#1976d2] to-[#2785e4] px-6 py-8 text-white shadow-lg shadow-blue-900/20 transition-transform duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4">
          <h4 className="text-3xl font-semibold">Start Your Trial</h4>
          <p className="mt-3 text-sm text-white/85">
            Deliver enterprise-grade goal alignment for every team with one unified portal.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1976d2] transition hover:bg-slate-100"
          >
            Get Started
          </Link>
        </div>
        <div className="rounded-2xl bg-slate-900 px-6 py-8 text-white shadow-lg shadow-slate-900/20 transition-transform duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 delay-150">
          <h4 className="text-3xl font-semibold">Download Case Studies</h4>
          <p className="mt-3 text-sm text-white/75">
            See how top-performing teams accelerate performance cycles with Phoenix.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/60"
          >
            Download
          </Link>
        </div>
      </section>
    </div>
  );
}
