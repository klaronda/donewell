import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { AboutPage } from './pages/AboutPage';
import { HowWeWorkPage } from './pages/HowWeWorkPage';
import { ServicesAgreementPage } from './pages/ServicesAgreementPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UnsubscribePage } from './pages/UnsubscribePage';
import { AdminProvider, useAdmin } from './contexts/AdminContext';

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'work' | 'about' | 'how-we-work' | 'services-agreement' | 'project' | 'admin' | 'unsubscribe'>('home');
  const [currentProjectSlug, setCurrentProjectSlug] = useState('');
  const { isAuthenticated } = useAdmin();

  // Simple client-side routing
  React.useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
      setCurrentPage('home');
    } else if (path === '/work') {
      setCurrentPage('work');
    } else if (path === '/about') {
      setCurrentPage('about');
    } else if (path === '/how-we-work') {
      setCurrentPage('how-we-work');
    } else if (path === '/services-agreement') {
      setCurrentPage('services-agreement');
    } else if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/unsubscribe') {
      setCurrentPage('unsubscribe');
    } else if (path.startsWith('/projects/')) {
      setCurrentPage('project');
      const slug = path.split('/projects/')[1];
      setCurrentProjectSlug(slug);
    }

    // Handle navigation
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath === '/' || newPath === '') {
        setCurrentPage('home');
      } else if (newPath === '/work') {
        setCurrentPage('work');
      } else if (newPath === '/about') {
        setCurrentPage('about');
      } else if (newPath === '/how-we-work') {
        setCurrentPage('how-we-work');
      } else if (newPath === '/services-agreement') {
        setCurrentPage('services-agreement');
      } else if (newPath === '/admin') {
        setCurrentPage('admin');
      } else if (newPath === '/unsubscribe') {
        setCurrentPage('unsubscribe');
      } else if (newPath.startsWith('/projects/')) {
        setCurrentPage('project');
        const slug = newPath.split('/projects/')[1];
        setCurrentProjectSlug(slug);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href) {
        const url = new URL(anchor.href);
        // Only handle internal links
        if (url.origin === window.location.origin) {
          e.preventDefault();
          const path = url.pathname;
          
          if (path === '/' || path === '') {
            setCurrentPage('home');
            window.history.pushState({}, '', '/');
          } else if (path === '/work') {
            setCurrentPage('work');
            window.history.pushState({}, '', '/work');
          } else if (path === '/about') {
            setCurrentPage('about');
            window.history.pushState({}, '', '/about');
          } else if (path === '/how-we-work') {
            setCurrentPage('how-we-work');
            window.history.pushState({}, '', '/how-we-work');
          } else if (path === '/services-agreement') {
            setCurrentPage('services-agreement');
            window.history.pushState({}, '', '/services-agreement');
          } else if (path === '/admin') {
            setCurrentPage('admin');
            window.history.pushState({}, '', '/admin');
          } else if (path === '/unsubscribe') {
            setCurrentPage('unsubscribe');
            window.history.pushState({}, '', '/unsubscribe');
          } else if (path.startsWith('/projects/')) {
            setCurrentPage('project');
            const slug = path.split('/projects/')[1];
            setCurrentProjectSlug(slug);
            window.history.pushState({}, '', path);
          }
          window.scrollTo(0, 0);
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleGetStartedClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLoginSuccess = () => {
    // Force re-render after successful login
    setCurrentPage('admin');
  };

  // Unsubscribe page (standalone, no header/footer)
  if (currentPage === 'unsubscribe') {
    return <UnsubscribePage />;
  }

  // Admin pages
  if (currentPage === 'admin') {
    if (!isAuthenticated) {
      return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    return <AdminDashboardPage />;
  }

  if (currentPage === 'work') {
    return (
      <WorkPage 
        onGetStartedClick={handleGetStartedClick}
        isModalOpen={isModalOpen}
        onModalClose={handleModalClose}
      />
    );
  }

  if (currentPage === 'about') {
    return (
      <AboutPage 
        onGetStartedClick={handleGetStartedClick}
        isModalOpen={isModalOpen}
        onModalClose={handleModalClose}
      />
    );
  }

  if (currentPage === 'how-we-work') {
    return (
      <HowWeWorkPage 
        onGetStartedClick={handleGetStartedClick}
        isModalOpen={isModalOpen}
        onModalClose={handleModalClose}
      />
    );
  }

  if (currentPage === 'services-agreement') {
    return (
      <ServicesAgreementPage 
        onGetStartedClick={handleGetStartedClick}
        isModalOpen={isModalOpen}
        onModalClose={handleModalClose}
      />
    );
  }

  if (currentPage === 'project') {
    return (
      <ProjectDetailPage 
        projectSlug={currentProjectSlug}
        onGetStartedClick={handleGetStartedClick}
        isModalOpen={isModalOpen}
        onModalClose={handleModalClose}
      />
    );
  }

  return (
    <HomePage 
      onGetStartedClick={handleGetStartedClick}
      isModalOpen={isModalOpen}
      onModalClose={handleModalClose}
    />
  );
}

export default function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}