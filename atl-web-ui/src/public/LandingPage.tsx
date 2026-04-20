import React, { useEffect, useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import { ProblemSolution, HowItWorks, Testimonials } from './components/Sections';
import ScrollToTop from './components/ScrollToTop';
import BookDemoModal from './components/BookDemoModal';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TRUST_LOGOS = ['ACME ACADEMY', 'GLOBAL SCHOOL', 'TECH INSTITUTE', 'MODERN COLLEGE', 'ZENITH'];

const LandingPage: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

  const openDemoModal = () => setIsDemoModalOpen(true);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: '#FFFFFF', color: '#0F1D3A' }}
    >
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[200] origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, #2A6DF4, #1A3D8A)',
        }}
      />

      <Navbar onBookDemo={openDemoModal} />

      <main>
        {/* ── 1. Hero ── */}
        <Hero onBookDemo={openDemoModal} />

        {/* ── 2. Trust Bar ── */}
        <section className="py-14 bg-white border-b" style={{ borderColor: '#E2E8F8' }}>
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
            <p
              className="text-center text-[11px] font-bold uppercase tracking-[0.22em] mb-8"
              style={{ color: '#C7D8FC' }}
            >
              Trusted by Forward-Thinking Institutions
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-6">
              {TRUST_LOGOS.map((name) => (
                <span
                  key={name}
                  className="text-[15px] font-bold tracking-tight cursor-default transition-all duration-300"
                  style={{ color: '#C7D8FC' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#2A6DF4'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#C7D8FC'; }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Problem / Solution ── */}
        <ProblemSolution />

        {/* ── 4. Features ── */}
        <Features />

        {/* ── 5. Experience Callout ── */}
        <section className="py-20" style={{ background: '#F7F9FF' }}>
          <div className="max-w-[900px] mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-[20px] p-16 lg:p-20 text-white text-center relative overflow-hidden"
              style={{ background: '#2A6DF4' }}
            >
              <div className="relative z-10">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.14em] mb-5 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
                >
                  Live Preview
                </span>
                <h2 className="text-[38px] lg:text-[52px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-5 text-white">
                  Ready to Experience<br />
                  <span style={{ fontWeight: 400, opacity: 0.8 }}>the Future of Education?</span>
                </h2>
                <p className="text-[16px] leading-relaxed max-w-md mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Start your free trial today. No credit card required. Experience institutional mastery.
                </p>
                <button
                  id="callout-cta-demo"
                  onClick={openDemoModal}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold transition-all duration-150 group"
                  style={{ background: '#FFFFFF', color: '#2A6DF4' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EBF1FE'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; }}
                >
                  Schedule a Consultation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              {/* decorative circles */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-[60px]" style={{ background: 'rgba(0,0,0,0.08)' }} />
            </motion.div>
          </div>
        </section>

        {/* ── 6. How it Works ── */}
        <HowItWorks />

        {/* ── 7. Pricing ── */}
        <Pricing />

        {/* ── 8. Testimonials ── */}
        <Testimonials />

        {/* ── 9. Final CTA ── */}
        <section className="py-24 bg-white">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-7"
            >
              <h2 className="text-[44px] lg:text-[60px] font-extrabold leading-[1.08] tracking-[-0.025em]" style={{ color: '#0F1D3A' }}>
                Unify. Automate.{' '}
                <span style={{ color: '#2A6DF4' }}>Excel.</span>
              </h2>
              <p className="text-[17px] leading-relaxed max-w-md mx-auto" style={{ color: '#5A6B88' }}>
                Join hundreds of forward-thinking institutions that have automated their success with{' '}
                <span style={{ color: '#2A6DF4', fontWeight: 600 }}>EduFlow.</span>
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <button
                  id="final-cta-trial"
                  onClick={() => navigate('/register-institute')}
                  className="flex items-center justify-center gap-2 px-9 py-4 rounded-full text-[15px] font-semibold text-white transition-all duration-150 group"
                  style={{
                    background: '#2A6DF4',
                    boxShadow: '0 4px 16px rgba(42,109,244,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#1A5CE0';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#2A6DF4';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  Activate Your Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  id="final-cta-contact"
                  onClick={openDemoModal}
                  className="flex items-center justify-center gap-2 px-9 py-4 rounded-full text-[15px] font-semibold transition-all duration-150"
                  style={{
                    background: '#FFFFFF',
                    color: '#0F1D3A',
                    border: '1.5px solid #E2E8F8',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#F7F9FF';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A6DF4';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F8';
                  }}
                >
                  Book a Demo
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
      <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
};

export default LandingPage;
