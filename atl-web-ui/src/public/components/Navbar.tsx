import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, ArrowRight, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onBookDemo?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onBookDemo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features',     href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing',      href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white border-b border-[#E2E8F8] shadow-sm'
          : 'bg-transparent'
      }`}
      style={{ height: '64px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 group"
          aria-label="EduFlow Home"
        >
          <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center group-hover:bg-primary-dark transition-colors duration-200 shadow-brand">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-[20px] font-bold text-[#0F1D3A] tracking-tight leading-none">
            EduFlow
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-2 rounded-[8px] text-[14px] font-medium text-[#5A6B88] hover:text-primary hover:bg-primary-light transition-all duration-150"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-[14px] font-semibold text-[#5A6B88] hover:text-primary rounded-[10px] transition-colors duration-150"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register-institute')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-pill text-[14px] font-semibold hover:bg-primary-hover transition-all duration-150 shadow-brand group"
            style={{ borderRadius: '9999px' }}
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          id="nav-mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#F7F9FF] border border-[#E2E8F8] text-[#5A6B88] hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-[#E2E8F8] shadow-lg z-50">
          <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-[10px] text-[15px] font-medium text-[#5A6B88] hover:text-primary hover:bg-primary-light transition-all"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 pb-1 flex flex-col gap-2 border-t border-[#E2E8F8]">
              <button
                onClick={() => { setIsOpen(false); onBookDemo?.(); }}
                className="w-full py-3 text-[14px] font-semibold text-primary border border-primary rounded-[10px] hover:bg-primary-light transition-colors"
              >
                Book a Demo
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setIsOpen(false); navigate('/login'); }}
                  className="py-3 text-[14px] font-semibold text-[#5A6B88] bg-[#F7F9FF] border border-[#E2E8F8] rounded-[10px]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsOpen(false); navigate('/register-institute'); }}
                  className="py-3 text-[14px] font-semibold text-white bg-primary rounded-[10px] shadow-brand"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
