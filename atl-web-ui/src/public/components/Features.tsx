import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Users,
  CalendarCheck,
  BarChart2,
  ShieldCheck,
  Smartphone,
  Cpu,
  Cloud,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    title: 'Fees Management',
    description: 'Automate fee collection, generate invoices, and track payments with intelligent reminders.',
    icon: CreditCard,
  },
  {
    title: 'Student Management',
    description: 'Maintain complete academic history, records, and behavioural tracking in a single dashboard.',
    icon: Users,
  },
  {
    title: 'Attendance Tracking',
    description: 'Digital attendance with instant parent notifications and detailed analytics reports.',
    icon: CalendarCheck,
  },
  {
    title: 'Smart Reporting',
    description: 'Advanced visual analytics to monitor institutional performance at every level.',
    icon: BarChart2,
  },
  {
    title: 'Bank-Grade Security',
    description: 'Your data is encrypted and protected with industry-leading security protocols.',
    icon: ShieldCheck,
  },
  {
    title: 'Mobile Accessible',
    description: 'Stay connected and manage your school from any device, anywhere in the world.',
    icon: Smartphone,
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const Features: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section id="features" className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      {/* Background tint orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-40 blur-[100px] -z-10" style={{ background: 'var(--brand-subtle)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-40 blur-[120px] -z-10" style={{ background: 'var(--brand-subtle)' }} />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-[560px] mx-auto mb-16"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full border"
            style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', borderColor: 'var(--brand-border)' }}
          >
            Capabilities
          </span>
          <h2 className="text-[38px] lg:text-[42px] font-bold leading-[1.18] tracking-[-0.01em] mb-5" style={{ color: 'var(--text-primary)' }}>
            A Unified Ecosystem{' '}
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              for Specialized Education
            </span>
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Every detail matters when managing talent. Our suite is designed to automate the
            mundane, so you can focus on the extraordinary.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group p-8 transition-all duration-200 cursor-default"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(-2px)';
                el.style.borderColor = 'var(--brand)';
                el.style.boxShadow = '0 8px 24px var(--brand-shadow, rgba(42,109,244,0.15))';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'var(--border)';
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-5 transition-all duration-200 group-hover:scale-110"
                style={{ background: 'var(--brand-subtle)' }}
              >
                <feature.icon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>

              <h3 className="text-[17px] font-semibold mb-2.5 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Highlight pair */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-10 relative overflow-hidden"
            style={{ background: 'var(--brand)', borderRadius: '12px' }}
          >
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-[24px] font-bold text-white mb-3 tracking-tight">AI Insights</h4>
              <p className="text-[14px] leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Predictive analytics that transform raw data into actionable institutional strategies.
              </p>
            </div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[60px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-10 relative overflow-hidden"
            style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: '12px' }}
          >
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-5" style={{ background: 'var(--brand-subtle)' }}>
                <Cloud className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>
              <h4 className="text-[24px] font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>Cloud Native</h4>
              <p className="text-[14px] leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Architected for resilience, global scale, and 99.99% operational continuity.
              </p>
            </div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[60px]" style={{ background: 'var(--brand-subtle)' }} />
          </motion.div>
        </div>

        {/* See All Features CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 text-center"
        >
          <button
            id="features-see-all"
            onClick={() => navigate('/features')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold text-white transition-all duration-150 group"
            style={{
              background: 'var(--brand)',
              boxShadow: '0 4px 20px rgba(42,109,244,0.35)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            Explore All Features
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="mt-3 text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>See how every module connects your institution end-to-end.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
