import React from 'react';
import { motion } from 'framer-motion';

const TermsConditionsPage: React.FC = () => {
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
            Terms of Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[18px] leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Last updated: April 30, 2026. Please read these terms carefully before using our platform.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              By accessing and using EduFlow ("the Platform"), you agree to be bound by these Terms of Service. If you are accepting these terms on behalf of an educational institution, you represent and warrant that you have the authority to bind the institution to these terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>2. Subscription and Licensing</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              EduFlow is provided on a Software as a Service (SaaS) subscription model. We grant you a limited, non-exclusive, non-transferable right to access and use the Platform solely for your internal institutional operations during your active subscription period.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>3. Account Responsibilities</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your tenant account. You agree to notify us immediately of any unauthorized use or security breach. We are not liable for any loss or damage arising from your failure to protect your login information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>4. Data Ownership and Access</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              You retain all rights and ownership to the data you input into the Platform. Upon termination or expiration of your subscription, we will provide you with a reasonable window to export your data before it is permanently deleted from our servers in accordance with our data retention policies.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>5. Prohibited Uses</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              You may not use the Platform to:
            </p>
            <ul className="space-y-2 text-[16px] leading-relaxed list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
              <li>Violate any local, state, or international laws or regulations.</li>
              <li>Infringe upon the intellectual property rights of others.</li>
              <li>Attempt to bypass security measures or access data belonging to other tenants.</li>
              <li>Transmit malicious software or engage in activities that disrupt the platform's performance.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>6. Limitation of Liability</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              EduFlow and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages, including but not loss of profits, data, or business opportunities, arising out of your use or inability to use the Platform.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default TermsConditionsPage;
