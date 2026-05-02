import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onBookDemo?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onBookDemo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features',     hash: '#features' },
    { name: 'How it Works', hash: '#how-it-works' },
    { name: 'Pricing',      hash: '#pricing' },
    { name: 'Testimonials', hash: '#testimonials' },
  ];

  const isHome = location.pathname === '/';

  const handleNavLinkClick = (hash: string) => {
    setIsOpen(false);
    if (isHome) {
      // Already on home — just scroll to section
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home with hash — LandingPage will scroll on mount
      navigate('/' + hash);
    }
  };

  const handleLogoClick = () => {
    setIsOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      style={{
        height: '64px',
        background: scrolled ? 'var(--bg-surface)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group"
          aria-label="EduFlow Home"
        >
          <div
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors duration-200"
            style={{ background: 'var(--brand)', boxShadow: '0 2px 8px rgba(42,109,244,0.35)' }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}>
            EduFlow
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavLinkClick(link.hash)}
              className="px-3 py-2 rounded-[8px] text-[14px] font-medium transition-all duration-150 border-none outline-none bg-transparent cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-subtle)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-[14px] font-semibold rounded-[10px] transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register-institute')}
            className="flex items-center gap-1.5 px-5 py-2.5 text-white text-[14px] font-semibold group transition-all duration-150"
            style={{ background: 'var(--brand)', borderRadius: '9999px', boxShadow: '0 4px 16px rgba(42,109,244,0.35)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)'}
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            id="nav-mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] transition-colors"
            style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 shadow-lg z-50" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavLinkClick(link.hash)}
                className="block w-full text-left px-4 py-3 rounded-[10px] text-[15px] font-medium transition-all bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-subtle)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
              >
                {link.name}
              </button>
            ))}
            <div className="pt-3 pb-1 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => { setIsOpen(false); onBookDemo?.(); }}
                className="w-full py-3 text-[14px] font-semibold rounded-[10px] transition-colors"
                style={{ color: 'var(--brand)', border: '1px solid var(--brand)' }}
              >
                Book a Demo
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setIsOpen(false); navigate('/login'); }}
                  className="py-3 text-[14px] font-semibold rounded-[10px]"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsOpen(false); navigate('/register-institute'); }}
                  className="py-3 text-[14px] font-semibold text-white rounded-[10px]"
                  style={{ background: 'var(--brand)' }}
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
