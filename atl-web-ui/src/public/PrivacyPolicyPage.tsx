import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage: React.FC = () => {
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
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[18px] leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Last updated: April 30, 2026. Your privacy and data security are our top priorities.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>1. Introduction</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              EduFlow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our Institution Management System (IMS) services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>2. Data Collection and Usage</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              As a multi-tenant SaaS platform, we act primarily as a Data Processor on behalf of the educational institutions (Data Controllers) that use our services. We collect:
            </p>
            <ul className="space-y-2 text-[16px] leading-relaxed list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
              <li><strong>Account Information:</strong> Names, email addresses, and roles necessary for authentication.</li>
              <li><strong>Institution Data:</strong> Academic structures, student records, and financial data inputted by the institution.</li>
              <li><strong>Usage Data:</strong> System logs, IP addresses, and session activity to ensure security and platform stability.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>3. Tenant Data Isolation</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              EduFlow employs strict tenant isolation mechanisms. Your institution's data is logically separated from other tenants. Cross-tenant data access is technologically restricted at both the gateway and application levels to ensure confidentiality.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>4. Security Measures</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We implement industry-standard zero-trust architecture, utilizing role-based access control (RBAC), JSON Web Tokens (JWT) for authentication, and encrypted data transmission (HTTPS) to protect your information against unauthorized access, alteration, or destruction.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>5. Third-Party Sharing</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers (such as hosting or payment processors like Razorpay) strictly for operating our business and providing the service, under confidentiality agreements.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>6. Contact Information</h2>
            <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer at <strong>privacy@eduflow.com</strong>.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
