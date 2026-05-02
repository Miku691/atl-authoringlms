import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, Search, Settings, Rocket, MessageSquare, Star, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   Problem / Solution
───────────────────────────────────────────── */
export const ProblemSolution: React.FC = () => {
  const problems = [
    'Hours spent on manual data entry every day.',
    'Scattered documents across multiple software.',
    'Lack of real-time insights for decision making.',
    'Poor communication between school & parents.',
  ];
  const solutions = [
    'Automated workflows save 70% of admin time.',
    'Unified platform for all institutional data.',
    'One-click visual reports & growth analytics.',
    'Instant multi-channel parent communication.',
  ];

  return (
    <section className="py-24 overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Problems */}
          <div className="flex-1">
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full border"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              The Challenge
            </span>
            <h2 className="text-[34px] lg:text-[40px] font-bold leading-[1.2] tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>
              Traditional Systems{' '}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>are Fixed &amp; Fragile.</span>
            </h2>
            <div className="space-y-3">
              {problems.map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-[12px] border"
                  style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <XCircle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                  </div>
                  <p className="text-[14px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="flex-1 rounded-[16px] p-10 relative overflow-hidden" style={{ background: 'var(--brand)' }}>
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full border"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.95)', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              The EduFlow Way
            </span>
            <h2 className="text-[26px] font-bold leading-[1.3] text-white mb-8 tracking-tight">
              Intelligent Automation for Modern Institutions
            </h2>
            <div className="space-y-3 relative z-10">
              {solutions.map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="flex items-start gap-4 p-4 rounded-[12px]"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(34,197,94,0.2)' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4ADE80' }} />
                  </div>
                  <p className="text-[14px] font-semibold text-white/95">{text}</p>
                </motion.div>
              ))}
            </div>
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[80px]" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   How it Works
───────────────────────────────────────────── */
export const HowItWorks: React.FC = () => {
  const steps = [
    { icon: Search,   title: 'Map',    desc: 'Identify institutional goals and existing data structures in minutes.' },
    { icon: Settings, title: 'Sync',   desc: 'Configure programs and fees through our guided onboarding wizard.' },
    { icon: Rocket,   title: 'Launch', desc: 'Activate faculty and students in a single unified, seamless flow.' },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-chrome)' }}>
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-50 blur-[100px] -z-10" style={{ background: 'var(--brand-subtle)' }} />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full border"
            style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', borderColor: 'var(--brand-border)' }}
          >
            Implementation
          </span>
          <h2 className="text-[36px] lg:text-[42px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Three Steps to Transformation
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[48px] left-[22%] right-[22%] h-[1px]" style={{ background: 'var(--border)' }} />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              className="relative z-10 group"
            >
              <div className="relative w-24 h-24 mx-auto mb-7">
                <div
                  className="w-24 h-24 rounded-[16px] flex items-center justify-center transition-all duration-200 group-hover:-translate-y-1 bg-surface border border-border group-hover:bg-brand shadow-sm"
                >
                  <step.icon className="w-8 h-8 text-brand group-hover:text-white transition-colors duration-200" />
                </div>
                {/* Step number */}
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white border-2"
                  style={{ background: 'var(--brand)', borderColor: 'var(--bg-surface)' }}
                >
                  0{i + 1}
                </div>
              </div>
              <h3 className="text-[20px] font-bold mb-2.5 tracking-tight" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
              <p className="text-[14px] leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   Testimonials — horizontal scrollable
───────────────────────────────────────────── */
export const Testimonials: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: 'Dr. Sarah James',
      role: 'Principal, St. Xavier School',
      quote: 'EduFlow has completely transformed how we track student progress and collect fees. It\'s a genuine game changer for our administration.',
      initials: 'SJ',
      rating: 5,
    },
    {
      name: 'Rajesh Sharma',
      role: 'Director, Target Classes',
      quote: 'The automation saved us thousands of man-hours. Our staff is happier, more productive, and the insights are incredible.',
      initials: 'RS',
      rating: 5,
    },
    {
      name: 'Monica G.',
      role: 'Admin, Little Hearts Academy',
      quote: 'The interface is so clean and intuitive. Even our least tech-savvy staff members learned it within a single day.',
      initials: 'MG',
      rating: 5,
    },
    {
      name: 'Prof. Ankit Verma',
      role: 'Dean, Pinnacle Engineering College',
      quote: 'Multi-campus management has never been simpler. EduFlow scales seamlessly and the tenant isolation gives us peace of mind.',
      initials: 'AV',
      rating: 5,
    },
    {
      name: 'Priya Nair',
      role: 'Finance Head, Sunrise Institute',
      quote: 'The fee ledger and concession workflows saved our accounts team 3 full days every month. Absolutely brilliant product.',
      initials: 'PN',
      rating: 5,
    },
    {
      name: 'Sanjay Kulkarni',
      role: 'Founder, KnowledgeHub Coaching',
      quote: 'The batch management and timetable features are world-class. Our faculty loves the assignment tools too.',
      initials: 'SK',
      rating: 5,
    },
    {
      name: 'Dr. Meera Pillai',
      role: 'HoD, National Public School',
      quote: 'Parent communication and attendance tracking are spot on. Parents feel more connected than ever before.',
      initials: 'MP',
      rating: 5,
    },
  ];

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 360;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section id="testimonials" className="py-24" style={{ background: 'var(--bg-main)' }}>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full border"
              style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', borderColor: 'var(--brand-border)' }}
            >
              Recognition
            </span>
            <h2 className="text-[34px] lg:text-[40px] font-bold leading-[1.2] tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Trusted by Leading{' '}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Institutional Figures.</span>
            </h2>
          </motion.div>

          {/* Nav arrows + rating */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5" style={{ fill: 'var(--brand)', color: 'var(--brand)' }} />
                ))}
              </div>
              <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>5,000+ Active Users</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 border"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                }}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 border"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                }}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.08, 0.4), duration: 0.55 }}
              className="flex flex-col gap-6 p-8 rounded-[16px] border transition-all duration-200 snap-start shrink-0"
              style={{
                background: 'var(--bg-chrome)',
                borderColor: 'var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                width: '340px',
                minWidth: '340px',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = 'var(--bg-surface)';
                el.style.boxShadow = '0 8px 24px var(--brand-shadow, rgba(42,109,244,0.15))';
                el.style.borderColor = 'var(--brand)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = 'var(--bg-chrome)';
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                el.style.borderColor = 'var(--border)';
                el.style.transform = 'translateY(0)';
              }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="w-4 h-4" style={{ fill: 'var(--brand)', color: 'var(--brand)' }} />
                ))}
              </div>

              {/* Quote icon */}
              <div className="w-9 h-9 rounded-[8px] flex items-center justify-center" style={{ background: 'var(--brand-subtle)' }}>
                <MessageSquare className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              </div>

              <p className="text-[15px] leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                  style={{ background: 'var(--brand)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</h4>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fade edges hint */}
        <p className="text-center text-[12px] mt-6 font-medium" style={{ color: 'var(--text-muted)' }}>
          Scroll to see more reviews →
        </p>
      </div>
    </section>
  );
};
