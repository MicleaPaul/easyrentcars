import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { supabase } from '../lib/supabase';
import type { TermsAndConditions } from '../types/database';

export function AGBPage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [sections, setSections] = useState<TermsAndConditions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchTerms();
  }, []);

  async function fetchTerms() {
    try {
      const { data, error } = await supabase
        .from('terms_and_conditions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSections(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching terms:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const getTitleByLanguage = (): string => {
    const titles: Record<string, string> = {
      de: 'Allgemeine Geschäftsbedingungen',
      en: 'Terms and Conditions',
      fr: 'Conditions Générales',
      it: 'Termini e Condizioni',
      es: 'Términos y Condiciones',
      ro: 'Termeni și Condiții',
    };
    return titles[language] || titles.de;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-[#9AA0A6]">{t('common.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || sections.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-12">
        <SEOHead
          title={`${getTitleByLanguage()} - EasyRentCars`}
          description="Allgemeine Geschäftsbedingungen für Autovermietung bei EasyRentCars in Graz"
          canonicalUrl="https://easyrentcars.rentals/agb"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-5xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F6C90E] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('common.back')}</span>
          </button>

          <div className="bg-[#111316] border border-[#D4AF37]/20 rounded-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
              {getTitleByLanguage()}
            </h1>
            <p className="text-[#9AA0A6]">
              {language === 'de' && 'Keine Informationen verfügbar.'}
              {language === 'en' && 'No information available.'}
              {language === 'fr' && 'Aucune information disponible.'}
              {language === 'it' && 'Nessuna informazione disponibile.'}
              {language === 'es' && 'No hay información disponible.'}
              {language === 'ro' && 'Nicio informație disponibilă.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-12">
      <SEOHead
        title={`${getTitleByLanguage()} - EasyRentCars`}
        description="Allgemeine Geschäftsbedingungen für Autovermietung bei EasyRentCars in Graz"
        canonicalUrl="https://easyrentcars.rentals/agb"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F6C90E] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{t('common.back')}</span>
        </button>

        <div className="bg-[#111316] border border-[#D4AF37]/20 rounded-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 pb-6 border-b border-[#D4AF37]/20">
            {getTitleByLanguage()}
          </h1>

          <div className="space-y-10">
            {sections.map((section, index) => {
              const headingKey = `heading_${language}` as keyof TermsAndConditions;
              const contentKey = `content_${language}` as keyof TermsAndConditions;
              const heading = section[headingKey] as string;
              const content = section[contentKey] as string[];

              return (
                <section key={section.id || index} className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold text-[#D4AF37] uppercase tracking-wide mb-4">
                    {heading}
                  </h2>
                  <div className="space-y-3">
                    {content.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-[#B8B9BB] leading-relaxed pl-4 border-l-2 border-[#D4AF37]/30 hover:border-[#D4AF37]/50 transition-colors">
                        {item}
                      </p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-[#D4AF37]/20">
            <p className="text-[#B8B9BB] text-sm text-center">
              © 2024 EasyRentCars. {language === 'de' && 'Alle Rechte vorbehalten.'}
              {language === 'en' && 'All rights reserved.'}
              {language === 'fr' && 'Tous droits réservés.'}
              {language === 'it' && 'Tutti i diritti riservati.'}
              {language === 'es' && 'Todos los derechos reservados.'}
              {language === 'ro' && 'Toate drepturile rezervate.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
