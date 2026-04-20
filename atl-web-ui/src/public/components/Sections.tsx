import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, Search, Settings, Rocket, MessageSquare, Star } from 'lucide-react';

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
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Problems */}
          <div className="flex-1">
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full"
              style={{ background: '#FEE2E2', color: '#DC2626' }}
            >
              The Challenge
            </span>
            <h2 className="text-[34px] lg:text-[40px] font-bold leading-[1.2] tracking-tight mb-8" style={{ color: '#0F1D3A' }}>
              Traditional Systems{' '}
              <span style={{ color: '#5A6B88', fontWeight: 500 }}>are Fixed &amp; Fragile.</span>
            </h2>
            <div className="space-y-3">
              {problems.map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-[12px] border"
                  style={{ background: '#FAFAFA', borderColor: '#E2E8F8' }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FEE2E2' }}>
                    <XCircle className="w-3.5 h-3.5" style={{ color: '#DC2626' }} />
                  </div>
                  <p className="text-[14px] font-medium leading-relaxed" style={{ color: '#5A6B88' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="flex-1 rounded-[16px] p-10 relative overflow-hidden" style={{ background: '#2A6DF4' }}>
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
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
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#DCFCE7' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#16A34A' }} />
                  </div>
                  <p className="text-[14px] font-semibold text-white/90">{text}</p>
                </motion.div>
              ))}
            </div>
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[80px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
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
    <section id="how-it-works" className="py-24 relative overflow-hidden" style={{ background: '#F7F9FF' }}>
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-50 blur-[100px] -z-10" style={{ background: '#EBF1FE' }} />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full"
            style={{ background: '#EBF1FE', color: '#2A6DF4' }}
          >
            Implementation
          </span>
          <h2 className="text-[36px] lg:text-[42px] font-bold tracking-tight" style={{ color: '#0F1D3A' }}>
            Three Steps to Transformation
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[48px] left-[22%] right-[22%] h-[1px]" style={{ background: '#E2E8F8' }} />

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
                  className="w-24 h-24 rounded-[16px] flex items-center justify-center transition-all duration-200 group-hover:-translate-y-1"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#2A6DF4'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#FFFFFF'; }}
                >
                  <step.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-200" style={{ color: '#2A6DF4' }} />
                </div>
                {/* Step number */}
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white border-2 border-white"
                  style={{ background: '#2A6DF4' }}
                >
                  0{i + 1}
                </div>
              </div>
              <h3 className="text-[20px] font-bold mb-2.5 tracking-tight" style={{ color: '#0F1D3A' }}>{step.title}</h3>
              <p className="text-[14px] leading-relaxed px-4" style={{ color: '#5A6B88' }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   Testimonials
───────────────────────────────────────────── */
export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name:  'Dr. Sarah James',
      role:  'Principal, St. Xavier School',
      quote: 'EduFlow has completely transformed how we track student progress and collect fees. It\'s a genuine game changer for our administration.',
      initials: 'SJ',
    },
    {
      name:  'Rajesh Sharma',
      role:  'Director, Target Classes',
      quote: 'The automation saved us thousands of man-hours. Our staff is happier, more productive, and the insights are incredible.',
      initials: 'RS',
    },
    {
      name:  'Monica G.',
      role:  'Admin, Little Hearts Academy',
      quote: 'The interface is so clean and intuitive. Even our least tech-savvy staff members learned it within a single day.',
      initials: 'MG',
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-white">
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
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full"
              style={{ background: '#EBF1FE', color: '#2A6DF4' }}
            >
              Recognition
            </span>
            <h2 className="text-[34px] lg:text-[40px] font-bold leading-[1.2] tracking-tight" style={{ color: '#0F1D3A' }}>
              Trusted by Leading{' '}
              <span style={{ color: '#5A6B88', fontWeight: 500 }}>Institutional Figures.</span>
            </h2>
          </motion.div>
          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5" style={{ fill: '#2A6DF4', color: '#2A6DF4' }} />
              ))}
            </div>
            <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: '#8FA3C0' }}>5,000+ Active Users</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              className="flex flex-col gap-6 p-8 rounded-[12px] border transition-all duration-200"
              style={{
                background: '#F7F9FF',
                borderColor: '#E2E8F8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = '#FFFFFF';
                el.style.boxShadow = '0 8px 24px rgba(42,109,244,0.10)';
                el.style.borderColor = '#2A6DF4';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = '#F7F9FF';
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                el.style.borderColor = '#E2E8F8';
              }}
            >
              {/* Quote icon */}
              <div className="w-9 h-9 rounded-[8px] flex items-center justify-center" style={{ background: '#EBF1FE' }}>
                <MessageSquare className="w-4 h-4" style={{ color: '#2A6DF4' }} />
              </div>

              <p className="text-[15px] leading-relaxed flex-1" style={{ color: '#5A6B88' }}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                  style={{ background: '#2A6DF4' }}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold" style={{ color: '#0F1D3A' }}>{t.name}</h4>
                  <p className="text-[11px] font-medium" style={{ color: '#8FA3C0' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
