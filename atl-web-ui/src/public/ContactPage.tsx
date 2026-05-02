import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
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
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[18px] leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <div className="space-y-6">
            <h2 className="text-[28px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Get in Touch</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-[10px] text-[15px] outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-[10px] text-[15px] outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-[10px] text-[15px] outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="john@institute.edu" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea rows={5} className="w-full px-4 py-3 rounded-[10px] text-[15px] outline-none transition-colors resize-none" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="How can we help you?"></textarea>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-[10px] text-[15px] font-semibold text-white transition-all duration-150"
                style={{ background: 'var(--brand)', boxShadow: '0 4px 16px rgba(42,109,244,0.35)' }}
              >
                Send Message
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 lg:mt-4">
            <div className="space-y-4">
              <h2 className="text-[28px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Our Offices</h2>
              <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We are headquartered in Bhubaneswar, Odisha, with a mission to serve educational institutions globally.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: 'var(--brand-subtle)' }}>
                  <Mail className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Email Support</h4>
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>support@eduflow.com</p>
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>sales@eduflow.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: 'var(--brand-subtle)' }}>
                  <Phone className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Phone</h4>
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>+91 98765 43210 (Sales)</p>
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>+91 98765 43211 (Support)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: 'var(--brand-subtle)' }}>
                  <MapPin className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Headquarters</h4>
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    Infocity IT Park<br />
                    Bhubaneswar, Odisha 751024<br />
                    India
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
