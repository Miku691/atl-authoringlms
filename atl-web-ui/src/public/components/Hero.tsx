import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Play, Shield, Zap, BarChart3, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onBookDemo?: () => void;
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Hero: React.FC<HeroProps> = ({ onBookDemo }) => {
  const navigate = useNavigate();

  return (
    <section
      className="relative pt-[96px] pb-20 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F7F9FF 0%, #EBF1FE 100%)' }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#2A6DF4 0.5px, transparent 0.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Soft orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-light opacity-60 blur-[120px] -z-10" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#EBF1FE] opacity-60 blur-[100px] -z-10" />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* ── Left: Content ── */}
          <motion.div
            className="flex-[1.1] text-center lg:text-left z-10"
            initial="hidden"
            animate="show"
            variants={containerVariants}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-8">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em]"
                style={{
                  background: '#EBF1FE',
                  color: '#2A6DF4',
                  borderRadius: '9999px',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI-Powered Institute Management
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-[52px] lg:text-[64px] font-extrabold leading-[1.08] tracking-[-0.02em] mb-6"
              style={{ color: '#0F1D3A' }}
            >
              Unifying Institutions{' '}
              <span className="block" style={{ color: '#2A6DF4' }}>
                with Precision.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-[18px] font-normal leading-[1.65] mb-10 max-w-[520px] mx-auto lg:mx-0"
              style={{ color: '#5A6B88' }}
            >
              Transform your administration with a bespoke AI-ready workspace. Move
              from chaos to{' '}
              <span style={{ color: '#2A6DF4', fontWeight: 600 }}>
                complete operational clarity
              </span>{' '}
              in weeks, not months.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              <button
                id="hero-cta-start"
                onClick={() => navigate('/register-institute')}
                className="flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white rounded-pill transition-all duration-150 group"
                style={{
                  background: '#2A6DF4',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 16px rgba(42,109,244,0.35)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1A5CE0';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(42,109,244,0.45)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2A6DF4';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(42,109,244,0.35)';
                }}
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                id="hero-cta-demo"
                onClick={onBookDemo}
                className="flex items-center gap-2 px-8 py-4 text-[15px] font-semibold rounded-pill transition-all duration-150"
                style={{
                  background: '#FFFFFF',
                  color: '#2A6DF4',
                  border: '1.5px solid #2A6DF4',
                  borderRadius: '9999px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#EBF1FE';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                }}
              >
                <Play className="w-4 h-4 fill-primary" style={{ fill: '#2A6DF4' }} />
                Book a Demo
              </button>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-8"
            >
              {[
                { icon: Shield,    label: 'ISO 27001 Certified' },
                { icon: BarChart3, label: 'Enterprise Grade' },
                { icon: Users,     label: '5,000+ Active Users' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: '#8FA3C0' }}>
                  <Icon className="w-4 h-4" style={{ color: '#5A6B88' }} />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Floating Dashboard Preview ── */}
          <motion.div
            className="flex-1 w-full relative"
            style={{ height: '480px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Main card surface */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[290px] rounded-[16px]"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F8',
                boxShadow: '0 16px 48px rgba(42,109,244,0.12)',
              }}
            >
              {/* Card header */}
              <div className="px-5 py-4 border-b border-[#E2E8F8] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: '#8FA3C0' }}>Dashboard Overview</p>
                  <p className="text-[14px] font-semibold mt-0.5" style={{ color: '#0F1D3A' }}>April 2026</p>
                </div>
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#EBF1FE' }}>
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: '#2A6DF4' }} />
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-px" style={{ background: '#E2E8F8' }}>
                {[
                  { label: 'Students', value: '2,842' },
                  { label: 'Revenue',  value: '₹24.8L' },
                  { label: 'Attend.',  value: '94.2%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white px-4 py-3">
                    <p className="text-[10px] font-medium mb-1" style={{ color: '#8FA3C0' }}>{stat.label}</p>
                    <p className="text-[18px] font-extrabold" style={{ color: '#0F1D3A' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
              {/* Mini bar chart */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color: '#8FA3C0' }}>Monthly Collection</p>
                <div className="flex items-end gap-1.5 h-14">
                  {[40, 65, 50, 85, 70, 90, 60].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-[3px] transition-all"
                      style={{
                        height: `${h}%`,
                        background: i === 5 ? '#2A6DF4' : '#EBF1FE',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Widget — Revenue */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[8%] -right-4 lg:right-0 w-[200px] rounded-[12px] p-4"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F8',
                boxShadow: '0 8px 24px rgba(42,109,244,0.12)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#8FA3C0' }}>Live Presence</p>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: '#DCFCE7', color: '#16A34A' }}>● LIVE</span>
              </div>
              <p className="text-[28px] font-extrabold leading-none" style={{ color: '#0F1D3A' }}>2,842</p>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="w-3 h-3" style={{ color: '#16A34A' }} />
                <p className="text-[11px] font-medium" style={{ color: '#16A34A' }}>+12% vs last month</p>
              </div>
            </motion.div>

            {/* Floating Widget — Quick checks */}
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-4 lg:left-0 w-[210px] rounded-[12px] p-4"
              style={{
                background: '#2A6DF4',
                boxShadow: '0 8px 32px rgba(42,109,244,0.35)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/60 mb-3">Quick Actions</p>
              {['Fee Collection', 'Add Student', 'Mark Attendance'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
                  <CheckCircle className="w-3.5 h-3.5 text-white/70 shrink-0" />
                  <span className="text-[12px] font-medium text-white/90">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* Floating Widget — Zap stat */}
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-[30%] -left-6 lg:-left-2 w-[160px] rounded-[12px] p-3.5"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F8',
                boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#EBF1FE' }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: '#2A6DF4' }} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#8FA3C0' }}>Efficiency</p>
              </div>
              <p className="text-[22px] font-extrabold" style={{ color: '#0F1D3A' }}>70%</p>
              <p className="text-[10px] font-medium" style={{ color: '#5A6B88' }}>admin time saved</p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
