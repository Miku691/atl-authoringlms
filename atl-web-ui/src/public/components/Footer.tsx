import React from 'react';
import { GraduationCap, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    Product:  ['Features', 'Dashboard', 'Pricing', 'Security', 'Mobile App'],
    Company:  ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'Careers'],
  };

  return (
    <footer style={{ background: '#0F1D3A', color: 'rgba(255,255,255,0.85)' }} className="pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: '#2A6DF4' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[22px] font-bold tracking-tight text-white">EduFlow</span>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Empowering educational institutions worldwide with innovative, AI-ready management solutions.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-all duration-150"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#2A6DF4';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)';
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-[14px] font-bold text-white mb-5">{heading}</h4>
              <ul className="space-y-3.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[13px] font-medium transition-colors duration-150"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-[14px] font-bold text-white mb-5">Contact Us</h4>
            <ul className="space-y-4">
              {[
                { Icon: Mail,   text: 'support@eduflow.com' },
                { Icon: Phone,  text: '+91 98765 43210' },
                { Icon: MapPin, text: 'Bhubaneswar, Odisha' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(42,109,244,0.20)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: '#2A6DF4' }} />
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2026 EduFlow SaaS. Built with pride for Odisha.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[12px] font-medium transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.80)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.25)'; }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] -z-10" style={{ background: 'rgba(42,109,244,0.06)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[100px] -z-10" style={{ background: 'rgba(42,109,244,0.04)' }} />
    </footer>
  );
};

export default Footer;
