import React from 'react';
import { motion } from 'framer-motion';

const CareersPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-16 px-6 lg:px-8 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-[900px] mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] lg:text-[52px] font-extrabold tracking-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Careers at EduFlow
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[18px] leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Join us in building the operating system for modern education. We're looking for passionate builders and thinkers.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto text-center space-y-8">
          <div className="p-12 rounded-[20px]" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
            <h2 className="text-[24px] font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>No open roles right now</h2>
            <p className="text-[16px] leading-relaxed max-w-lg mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              We are currently fully staffed, but we are always on the lookout for exceptional talent. If you believe you can make a significant impact at EduFlow, we'd still love to hear from you.
            </p>
            <a 
              href="mailto:careers@eduflow.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all duration-150"
              style={{ background: 'var(--brand)', boxShadow: '0 4px 16px rgba(42,109,244,0.35)' }}
            >
              Send Open Application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
