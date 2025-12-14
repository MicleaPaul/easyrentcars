import { useNavigate } from 'react-router-dom';
import { Home, Car } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from '../components/Logo';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-8">
            <Logo variant="header" alt="EasyRentCars Logo" />
          </div>
          <h1 className="text-[180px] font-bold text-gradient leading-none mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">{t('notFound.title')}</h2>
          <p className="text-[#9AA0A6] text-lg mb-8">
            {t('notFound.message')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="btn-primary px-8 py-4 flex items-center justify-center gap-3 text-base font-bold uppercase tracking-wide"
          >
            <Home className="w-5 h-5" />
            {t('notFound.goHome')}
          </button>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const fleetSection = document.getElementById('fleet');
                if (fleetSection) {
                  fleetSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="px-8 py-4 bg-[#111316] text-white rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#111316]/80 transition-all flex items-center justify-center gap-3 text-base font-bold uppercase tracking-wide"
          >
            <Car className="w-5 h-5" />
            {t('notFound.browseFleet')}
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-[#D4AF37]/10">
          <p className="text-[#9AA0A6] text-sm">
            {t('notFound.needHelp')}{' '}
            <a
              href="mailto:info@easyrentcars.rentals"
              className="text-[#D4AF37] hover:text-[#F4D03F] transition-colors"
            >
              info@easyrentcars.rentals
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
