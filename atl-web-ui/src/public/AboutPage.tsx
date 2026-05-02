import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6 lg:px-8 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-[900px] mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] lg:text-[52px] font-extrabold tracking-tight mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            About EduFlow
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[18px] leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            We are on a mission to modernize education management with intelligent, scalable, and intuitive technology.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-[28px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Our Vision</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              EduFlow was founded with a singular vision: to empower educational institutions to focus on what truly matters—student success—by removing the friction of administrative operations. We believe that technology should be an enabler, not a hurdle, and our platform is designed to provide unprecedented operational clarity.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[28px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Why We Built EduFlow</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Traditional educational ERP systems are often fragmented, difficult to use, and require heavy manual intervention. We built EduFlow to be a zero-trust, multi-tenant SaaS platform that scales effortlessly from small coaching centers to large university campuses. Our architecture ensures that your data is secure, your workflows are streamlined, and your insights are available in real-time.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[28px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Our Values</h2>
            <ul className="space-y-4 text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-3">
                <span className="font-bold shrink-0 mt-1" style={{ color: 'var(--brand)' }}>•</span>
                <span><strong>Security First:</strong> Zero trust architecture and strict tenant isolation are non-negotiable foundations of our platform.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold shrink-0 mt-1" style={{ color: 'var(--brand)' }}>•</span>
                <span><strong>Design Excellence:</strong> We believe enterprise software can and should be beautiful, intuitive, and a joy to use.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold shrink-0 mt-1" style={{ color: 'var(--brand)' }}>•</span>
                <span><strong>Continuous Innovation:</strong> Education is evolving rapidly, and our platform is built to integrate with AI and future-ready paradigms.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AboutPage;
