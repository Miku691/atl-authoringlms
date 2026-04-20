import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  CreditCard,
  Users,
  CalendarCheck,
  BarChart2,
  ShieldCheck,
  Smartphone,
  Cpu,
  Cloud,
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
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Background tint orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-40 blur-[100px] -z-10" style={{ background: '#EBF1FE' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-40 blur-[120px] -z-10" style={{ background: '#EBF1FE' }} />

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
            className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full"
            style={{ background: '#EBF1FE', color: '#2A6DF4' }}
          >
            Capabilities
          </span>
          <h2 className="text-[38px] lg:text-[42px] font-bold leading-[1.18] tracking-[-0.01em] mb-5" style={{ color: '#0F1D3A' }}>
            A Unified Ecosystem{' '}
            <span style={{ color: '#5A6B88', fontWeight: 500 }}>
              for Specialized Education
            </span>
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: '#5A6B88' }}>
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
              className="group rounded-card p-8 border transition-all duration-200 cursor-default"
              style={{
                background: '#FFFFFF',
                borderColor: '#E2E8F8',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = '0 8px 24px rgba(42,109,244,0.10)';
                el.style.transform = 'translateY(-2px)';
                el.style.borderColor = '#2A6DF4';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                el.style.transform = 'translateY(0)';
                el.style.borderColor = '#E2E8F8';
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-5 transition-all duration-200 group-hover:scale-110"
                style={{ background: '#EBF1FE' }}
              >
                <feature.icon className="w-5 h-5" style={{ color: '#2A6DF4' }} />
              </div>

              <h3 className="text-[17px] font-semibold mb-2.5 tracking-tight" style={{ color: '#0F1D3A' }}>
                {feature.title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: '#5A6B88' }}>
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
            className="rounded-card p-10 relative overflow-hidden"
            style={{ background: '#2A6DF4', borderRadius: '12px' }}
          >
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-[24px] font-bold text-white mb-3 tracking-tight">AI Insights</h4>
              <p className="text-[14px] leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>
                Predictive analytics that transform raw data into actionable institutional strategies.
              </p>
            </div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[60px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-card p-10 relative overflow-hidden"
            style={{ background: '#F7F9FF', border: '1px solid #E2E8F8', borderRadius: '12px' }}
          >
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-5" style={{ background: '#EBF1FE' }}>
                <Cloud className="w-5 h-5" style={{ color: '#2A6DF4' }} />
              </div>
              <h4 className="text-[24px] font-bold mb-3 tracking-tight" style={{ color: '#0F1D3A' }}>Cloud Native</h4>
              <p className="text-[14px] leading-relaxed max-w-xs" style={{ color: '#5A6B88' }}>
                Architected for resilience, global scale, and 99.99% operational continuity.
              </p>
            </div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[60px]" style={{ background: '#EBF1FE' }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
