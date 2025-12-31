import { X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToSection = (sectionId: string) => {
    const headerOffset = 100;

    const scrollToElement = (element: HTMLElement) => {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    };

    onClose();

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          scrollToElement(section);
        }
      }, 100);
    } else {
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          scrollToElement(section);
        }
      }, 50);
    }
  };

  const handleHome = () => {
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 touch-manipulation"
        onClick={onClose}
        role="button"
        aria-label="Close menu"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />

      <div
        className="fixed top-0 right-0 h-full w-[min(300px,85vw)] bg-[#0B0C0F] border-l border-[#D4AF37]/20 z-50 transform transition-transform duration-300 overflow-y-auto"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex flex-col p-4 xs:p-6 border-b border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-4">
            <Logo variant="header" className="px-1 max-w-[130px] xs:max-w-[150px]" alt="EasyRentCars Logo" />
            <button
              onClick={onClose}
              className="min-w-touch min-h-touch w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#111316] active:bg-[#1a1c20] transition-colors touch-manipulation"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <h2 className="text-base xs:text-lg font-bold text-white uppercase tracking-wide">{t('menu.title')}</h2>
        </div>

        <nav className="p-4 xs:p-6 space-y-2">
          <button
            onClick={handleHome}
            className="block w-full text-left text-white hover:text-[#D4AF37] active:text-[#D4AF37] transition-colors font-medium text-base xs:text-lg uppercase tracking-wide py-4 border-b border-[#D4AF37]/10 min-h-touch touch-manipulation"
          >
            {t('nav.home')}
          </button>
          <button
            onClick={() => handleScrollToSection('fleet')}
            className="block w-full text-left text-white hover:text-[#D4AF37] active:text-[#D4AF37] transition-colors font-medium text-base xs:text-lg uppercase tracking-wide py-4 border-b border-[#D4AF37]/10 min-h-touch touch-manipulation"
          >
            {t('nav.fleet')}
          </button>
          <button
            onClick={() => handleScrollToSection('faq')}
            className="block w-full text-left text-white hover:text-[#D4AF37] active:text-[#D4AF37] transition-colors font-medium text-base xs:text-lg uppercase tracking-wide py-4 border-b border-[#D4AF37]/10 min-h-touch touch-manipulation"
          >
            {t('nav.faq')}
          </button>
          <button
            onClick={() => handleScrollToSection('contact')}
            className="block w-full text-left text-white hover:text-[#D4AF37] active:text-[#D4AF37] transition-colors font-medium text-base xs:text-lg uppercase tracking-wide py-4 border-b border-[#D4AF37]/10 min-h-touch touch-manipulation"
          >
            {t('nav.contact')}
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/agb');
            }}
            className="block w-full text-left text-white hover:text-[#D4AF37] active:text-[#D4AF37] transition-colors font-medium text-base xs:text-lg uppercase tracking-wide py-4 border-b border-[#D4AF37]/10 min-h-touch touch-manipulation"
          >
            {t('nav.agb')}
          </button>

          <button
            onClick={() => handleScrollToSection('search')}
            className="w-full mt-6 btn-primary px-6 py-4 uppercase text-base font-bold min-h-[52px] touch-manipulation active:scale-[0.98] transition-transform"
          >
            {t('hero.cta')}
          </button>
        </nav>
      </div>
    </>
  );
}
