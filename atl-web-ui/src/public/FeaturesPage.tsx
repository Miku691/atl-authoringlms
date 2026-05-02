import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Users, CalendarCheck, BarChart2, ShieldCheck, Smartphone,
  Cpu, Cloud, BookOpen, Bell, FileText, GraduationCap, Building2,
  Receipt, TrendingUp, Globe, Lock, Zap, ArrowRight, CheckCircle2,
} from 'lucide-react';

/* ── Data ── */
const moduleCategories = [
  {
    id: 'academics',
    badge: 'Academics',
    color: '#6366F1',
    title: 'Complete Academic Management',
    subtitle: 'From curriculum design to result publication — every step in one place.',
    icon: GraduationCap,
    features: [
      { icon: BookOpen, name: 'Curriculum & Syllabus', desc: 'Define syllabi per offering, track coverage progress, and sync with timetables.' },
      { icon: CalendarCheck, name: 'Timetable Engine', desc: 'Drag-and-drop scheduling with conflict detection and faculty availability checks.' },
      { icon: BarChart2, name: 'Grading & Results', desc: 'Configurable grade boundaries, marksheet generation, and rank analytics.' },
      { icon: TrendingUp, name: 'Promotion Center', desc: 'Automate year-end promotions with eligibility rules and bulk processing.' },
    ],
  },
  {
    id: 'people',
    badge: 'People',
    color: '#0EA5E9',
    title: 'Unified People Management',
    subtitle: 'Students, faculty, staff, and guardians — all managed with precision.',
    icon: Users,
    features: [
      { icon: Users, name: 'Student Profiles', desc: 'Complete academic history, guardian links, behavioral logs, and document storage.' },
      { icon: Building2, name: 'Faculty & Staff', desc: 'Profiles, availability calendars, subject assignments, and payroll-ready data.' },
      { icon: Bell, name: 'Guardian Portal', desc: 'Real-time notifications, fee statements, and attendance summaries for parents.' },
      { icon: FileText, name: 'Bulk Admissions', desc: 'Import hundreds of students via CSV with validation and de-duplication.' },
    ],
  },
  {
    id: 'finance',
    badge: 'Finance',
    color: '#10B981',
    title: 'Enterprise-Grade Finance Suite',
    subtitle: 'Full-cycle financial management with automation at every touchpoint.',
    icon: CreditCard,
    features: [
      { icon: Receipt, name: 'Fee Structures', desc: 'Multi-tier fee heads, installment plans, and offering-specific configurations.' },
      { icon: CreditCard, name: 'Collection Desk', desc: 'Online and offline collection, receipt generation, and reconciliation tools.' },
      { icon: TrendingUp, name: 'Budget & Expenses', desc: 'Category-wise expense tracking, budget allocation, and variance reports.' },
      { icon: FileText, name: 'Concession Workflows', desc: 'Approval-based discount management with audit trails and limits.' },
    ],
  },
  {
    id: 'security',
    badge: 'Security',
    color: '#F59E0B',
    title: 'Zero-Trust Security Architecture',
    subtitle: 'Your institution\'s data is protected by multiple layers of modern security.',
    icon: ShieldCheck,
    features: [
      { icon: Lock, name: 'Role-Based Access', desc: 'Granular permissions per role — TENANT_ADMIN, INSTRUCTOR, STUDENT, and more.' },
      { icon: ShieldCheck, name: 'Tenant Isolation', desc: 'Strict multi-tenant boundaries. Your data is never accessible to other tenants.' },
      { icon: Globe, name: 'JWT Authentication', desc: 'Stateless, secure token-based authentication with expiry and refresh controls.' },
      { icon: Cloud, name: 'Audit Logs', desc: 'Every critical action is logged with user, timestamp, and context for compliance.' },
    ],
  },
  {
    id: 'operations',
    badge: 'Operations',
    color: '#EC4899',
    title: 'Day-to-Day Operations Simplified',
    subtitle: 'Attendance, assignments, and communication — all on autopilot.',
    icon: Zap,
    features: [
      { icon: CalendarCheck, name: 'Attendance Tracking', desc: 'Class-wise digital attendance with instant parent alerts and monthly analytics.' },
      { icon: BookOpen, name: 'Assignments & LMS', desc: 'Create, distribute, and grade assignments with submission tracking.' },
      { icon: Bell, name: 'Announcements', desc: 'Broadcast targeted notifications to students, parents, or specific batches.' },
      { icon: Smartphone, name: 'Mobile Ready', desc: 'Every feature is accessible on phone and tablet — no separate mobile app needed.' },
    ],
  },
  {
    id: 'insights',
    badge: 'Intelligence',
    color: '#8B5CF6',
    title: 'AI-Ready Analytics & Insights',
    subtitle: 'Powerful dashboards and predictive insights to drive institutional decisions.',
    icon: Cpu,
    features: [
      { icon: BarChart2, name: 'Financial Reports', desc: 'Collection summaries, defaulter lists, and fee realization analytics at a click.' },
      { icon: TrendingUp, name: 'Academic Reports', desc: 'Attendance trends, performance heat maps, and subject-wise analytics.' },
      { icon: Cpu, name: 'AI Insights (Phase 2)', desc: 'Predictive analytics for dropout risk, fee default probability, and more.' },
      { icon: Cloud, name: 'Export & Integration', desc: 'Export to Excel/PDF and integrate with third-party reporting tools.' },
    ],
  },
];

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CONTAINER_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section
        className="pt-24 pb-20 px-6 lg:px-8 relative overflow-hidden"
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] -z-0 opacity-40" style={{ background: 'var(--brand-subtle)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] -z-0 opacity-30" style={{ background: 'var(--brand-subtle)' }} />

        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[11px] font-bold uppercase tracking-[0.15em] mb-6 px-4 py-1.5 rounded-full border"
            style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', borderColor: 'var(--brand-border)' }}
          >
            Platform Capabilities
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[44px] lg:text-[60px] font-extrabold tracking-[-0.025em] leading-[1.08] mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Every Feature Your{' '}
            <span style={{ color: 'var(--brand)' }}>Institution Needs.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[18px] leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: 'var(--text-secondary)' }}
          >
            EduFlow brings academics, finance, people, operations, and security into a single, deeply integrated platform — designed specifically for how educational institutions actually work.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={() => navigate('/register-institute')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold text-white transition-all duration-150 group"
              style={{ background: 'var(--brand)', boxShadow: '0 4px 20px rgba(42,109,244,0.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)'; }}
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold transition-all duration-150"
              style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
            >
              Talk to Sales
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-10 border-y" style={{ background: 'var(--bg-chrome)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '15+', label: 'Modules Integrated' },
            { value: '50+', label: 'Configurable Workflows' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '3 min', label: 'Average Onboarding' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-[32px] font-extrabold tracking-tight" style={{ color: 'var(--brand)' }}>{stat.value}</p>
              <p className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Module sections ── */}
      {moduleCategories.map((cat, catIdx) => (
        <section
          key={cat.id}
          id={`feature-${cat.id}`}
          className="py-24 px-6 lg:px-8 relative overflow-hidden"
          style={{ background: catIdx % 2 === 0 ? 'var(--bg-main)' : 'var(--bg-surface)' }}
        >
          {/* Accent glow */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[140px] -z-0 opacity-20"
            style={{ background: cat.color }}
          />

          <div className="max-w-[1100px] mx-auto relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="flex flex-col lg:flex-row lg:items-center gap-8 mb-16"
            >
              <div className="flex-1">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.14em] mb-4 px-3 py-1 rounded-full border"
                  style={{ background: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}30` }}
                >
                  {cat.badge}
                </span>
                <h2 className="text-[32px] lg:text-[40px] font-extrabold tracking-tight leading-[1.15] mb-3" style={{ color: 'var(--text-primary)' }}>
                  {cat.title}
                </h2>
                <p className="text-[17px] leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  {cat.subtitle}
                </p>
              </div>
              {/* Module icon badge */}
              <div
                className="w-24 h-24 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg"
                style={{ background: `${cat.color}15`, border: `2px solid ${cat.color}30` }}
              >
                <cat.icon className="w-12 h-12" style={{ color: cat.color }} />
              </div>
            </motion.div>

            {/* Feature cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              variants={CONTAINER_VARIANTS}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {cat.features.map((feat) => (
                <motion.div
                  key={feat.name}
                  variants={CARD_VARIANTS}
                  className="flex gap-5 p-7 rounded-[14px] border transition-all duration-200"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = cat.color;
                    el.style.boxShadow = `0 6px 20px ${cat.color}20`;
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'var(--border)';
                    el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${cat.color}15` }}
                  >
                    <feat.icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold mb-1.5 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {feat.name}
                    </h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ))}

      {/* ── Comparison/Why EduFlow section ── */}
      <section className="py-24 px-6 lg:px-8" style={{ background: 'var(--bg-surface)' }}>
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.14em] mb-4 px-3 py-1 rounded-full border"
              style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', borderColor: 'var(--brand-border)' }}
            >
              Why EduFlow
            </span>
            <h2 className="text-[36px] lg:text-[44px] font-extrabold tracking-tight leading-[1.15]" style={{ color: 'var(--text-primary)' }}>
              Built Different, By Design
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            variants={CONTAINER_VARIANTS}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              'Multi-tenant SaaS — full data isolation between institutions',
              'Configurable for Schools, Colleges, and Coaching Centers',
              'Zero-trust API gateway with role-based access control',
              'AI-ready architecture for future intelligence integration',
              'Progressive onboarding — go live in minutes, not months',
              'Works on any device — no native app installation needed',
              'Transparent pricing — no hidden seat fees or module locks',
              'Built on Spring Boot microservices for extreme reliability',
            ].map((point, i) => (
              <motion.div
                key={i}
                variants={CARD_VARIANTS}
                className="flex items-start gap-3 p-5 rounded-[12px] border"
                style={{ background: 'var(--bg-chrome)', borderColor: 'var(--border)' }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--brand)' }} />
                <p className="text-[15px] font-medium leading-snug" style={{ color: 'var(--text-secondary)' }}>{point}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 lg:px-8" style={{ background: 'var(--bg-main)' }}>
        <div className="max-w-[700px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-[40px] lg:text-[52px] font-extrabold tracking-[-0.02em] leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
              Ready to See It{' '}
              <span style={{ color: 'var(--brand)' }}>In Action?</span>
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Start your free trial today or book a personalized demo with our team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <button
                onClick={() => navigate('/register-institute')}
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-[15px] font-semibold text-white transition-all duration-150 group"
                style={{ background: 'var(--brand)', boxShadow: '0 4px 20px rgba(42,109,244,0.35)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)'; }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full text-[15px] font-semibold transition-all duration-150"
                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              >
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default FeaturesPage;
