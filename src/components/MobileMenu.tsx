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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-[280px] bg-[#0B0C0F] border-l border-[#D4AF37]/20 z-50 transform transition-transform duration-300">
        <div className="flex flex-col p-6 border-b border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-4">
            <Logo variant="header" className="px-1" alt="EasyRentCars Logo" />
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#111316] transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">{t('menu.title')}</h2>
        </div>

        <nav className="p-6 space-y-4">
          <button
            onClick={handleHome}
            className="block w-full text-left text-white hover:text-[#D4AF37] transition-colors font-medium text-lg uppercase tracking-wide py-3 border-b border-[#D4AF37]/10"
          >
            {t('nav.home')}
          </button>
          <button
            onClick={() => handleScrollToSection('fleet')}
            className="block w-full text-left text-white hover:text-[#D4AF37] transition-colors font-medium text-lg uppercase tracking-wide py-3 border-b border-[#D4AF37]/10"
          >
            {t('nav.fleet')}
          </button>
          <button
            onClick={() => handleScrollToSection('faq')}
            className="block w-full text-left text-white hover:text-[#D4AF37] transition-colors font-medium text-lg uppercase tracking-wide py-3 border-b border-[#D4AF37]/10"
          >
            {t('nav.faq')}
          </button>
          <button
            onClick={() => handleScrollToSection('contact')}
            className="block w-full text-left text-white hover:text-[#D4AF37] transition-colors font-medium text-lg uppercase tracking-wide py-3 border-b border-[#D4AF37]/10"
          >
            {t('nav.contact')}
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/agb');
            }}
            className="block w-full text-left text-white hover:text-[#D4AF37] transition-colors font-medium text-lg uppercase tracking-wide py-3 border-b border-[#D4AF37]/10"
          >
            {t('nav.agb')}
          </button>

          <button
            onClick={() => handleScrollToSection('search')}
            className="w-full mt-6 btn-primary px-6 py-4 uppercase"
          >
            {t('hero.cta')}
          </button>
        </nav>
      </div>
    </>
  );
}
