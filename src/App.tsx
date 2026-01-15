import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { useBooking } from './contexts/BookingContext';
import { HomePage } from './pages/HomePage';
import { CarDetailsPage } from './pages/CarDetailsPage';
import { BookingPageNew } from './pages/BookingPageNew';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { AGBPage } from './pages/AGBPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { Footer } from './components/Footer';
import { MobileMenu } from './components/MobileMenu';
import { StructuredData } from './components/StructuredData';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Logo } from './components/Logo';
import { SkipToContent } from './components/SkipToContent';
import { CookieConsent } from './components/CookieConsent';
import { ScrollToTop } from './components/ScrollToTop';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const { clearBookingData } = useBooking();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleBookingComplete = () => {
    clearBookingData();
    navigate('/');
  };

  const handleScrollToSection = (sectionId: string) => {
    const headerOffset = 100;
    setIsMobileMenuOpen(false);

    const scrollToElement = (element: HTMLElement) => {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          scrollToElement(section);
        }
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        scrollToElement(section);
      }
    }
  };

  if (isAuthPage) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#0B0C0F]">
      <SkipToContent />
      <StructuredData />
      {!isAdminPage && (
        <header className="fixed top-0 w-full z-50 bg-[#0B0C0F]/95 backdrop-blur-xl border-b border-[#D4AF37]/10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-12 py-2 xs:py-2.5 sm:py-3 flex items-center justify-between max-w-[1440px]">
            <button onClick={() => navigate('/')} className="flex items-center px-1 xs:px-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0B0C0F] rounded-sm touch-manipulation min-h-touch" aria-label="EasyRentCars home">
              <Logo
                variant="header"
                className="hover:opacity-90 transition-opacity max-w-[140px] xs:max-w-[160px] sm:max-w-none"
                alt="EasyRentCars Logo"
              />
            </button>

            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-[#F5F7FA] hover:text-[#D4AF37] transition-colors font-medium text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0B0C0F] rounded-sm" aria-label="Navigate to home page">
                {t('nav.home')}
              </button>
              <button onClick={() => handleScrollToSection('fleet')} className="text-[#F5F7FA] hover:text-[#D4AF37] transition-colors font-medium text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0B0C0F] rounded-sm">
                {t('nav.fleet')}
              </button>
              <button onClick={() => handleScrollToSection('faq')} className="text-[#F5F7FA] hover:text-[#D4AF37] transition-colors font-medium text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0B0C0F] rounded-sm">
                {t('nav.faq')}
              </button>
              <button onClick={() => handleScrollToSection('contact')} className="text-[#F5F7FA] hover:text-[#D4AF37] transition-colors font-medium text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0B0C0F] rounded-sm">
                {t('nav.contact')}
              </button>
              <button onClick={() => navigate('/agb')} className="text-[#F5F7FA] hover:text-[#D4AF37] transition-colors font-medium text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0B0C0F] rounded-sm" aria-label="Navigate to terms and conditions page">
                {t('nav.agb')}
              </button>
            </nav>

            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-[#111316] text-white px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg border border-[#D4AF37]/20 focus:outline-none focus:border-[#D4AF37] font-medium text-xs sm:text-sm min-h-touch touch-manipulation"
              >
                <option value="de">DE</option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="it">IT</option>
                <option value="es">ES</option>
                <option value="ro">RO</option>
              </select>
              <button
                onClick={() => handleScrollToSection('search')}
                className="hidden md:block btn-primary px-6 py-2.5 text-sm uppercase tracking-wide min-h-touch"
              >
                {t('hero.cta')}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden min-w-touch min-h-touch w-11 h-11 flex items-center justify-center rounded-lg bg-[#111316] border border-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-black transition-all active:scale-95 touch-manipulation"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
      )}

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main id="main-content" role="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/car/:id"
            element={
              <CarDetailsPage
                onBack={() => navigate('/')}
              />
            }
          />
          <Route
            path="/booking/:id"
            element={
              <BookingPageNew
                onBack={() => navigate(-1)}
                onComplete={handleBookingComplete}
              />
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/agb" element={<AGBPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
