import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    Product:  [
      { name: 'All Features', href: '/features' },
      { name: 'Dashboard', href: '/login' },
      { name: 'Pricing', href: '/#pricing' },
      { name: 'Security', href: '/privacy-policy' },
    ],
    Company:  [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };


  return (
    <footer style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }} className="pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--brand)' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>EduFlow</span>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Empowering educational institutions worldwide with innovative, AI-ready management solutions.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-all duration-150"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'var(--brand)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-surface)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
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
              <h4 className="text-[14px] font-bold mb-5" style={{ color: 'var(--text-primary)' }}>{heading}</h4>
              <ul className="space-y-3.5">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-[13px] font-medium transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--brand)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-[14px] font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Contact Us</h4>
            <ul className="space-y-4">
              {[
                { Icon: Mail,   text: 'support@eduflow.com' },
                { Icon: Phone,  text: '+91 98765 43210' },
                { Icon: MapPin, text: 'Bhubaneswar, Odisha' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--brand-subtle)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} EduFlow SaaS. Built with pride for Odisha.
          </p>
          <div className="flex gap-6">
            {[
              { name: 'Privacy', href: '/privacy-policy' },
              { name: 'Terms', href: '/terms' },
              { name: 'Cookies', href: '/privacy-policy' }
            ].map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-[12px] font-medium transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] -z-10" style={{ background: 'var(--brand-subtle)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[100px] -z-10" style={{ background: 'var(--brand-subtle)' }} />
    </footer>
  );
};

export default Footer;
