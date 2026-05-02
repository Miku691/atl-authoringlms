import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BookDemoModal from './components/BookDemoModal';

const PublicLayout: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

  const openDemoModal = () => setIsDemoModalOpen(true);

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <Navbar onBookDemo={openDemoModal} />

      <main className="flex-1 pt-[64px]">
        <Outlet context={{ openDemoModal }} />
      </main>

      <Footer />
      <ScrollToTop />
      <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
};

export default PublicLayout;
