import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface FAQ {
  id: string;
  question_de: string;
  answer_de: string;
  question_en: string;
  answer_en: string;
  question_fr: string;
  answer_fr: string;
  question_it: string;
  answer_it: string;
  question_es: string;
  answer_es: string;
  question_ro: string;
  answer_ro: string;
  is_popular: boolean;
  display_order: number;
}

export function FAQSection() {
  const { t, language } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  async function fetchFAQs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_hidden', false)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  }

  const getQuestion = (faq: FAQ) => {
    const questionMap: Record<string, string> = {
      de: faq.question_de,
      en: faq.question_en,
      fr: faq.question_fr,
      it: faq.question_it,
      es: faq.question_es,
      ro: faq.question_ro,
    };
    return questionMap[language] || faq.question_en;
  };

  const getAnswer = (faq: FAQ) => {
    const answerMap: Record<string, string> = {
      de: faq.answer_de,
      en: faq.answer_en,
      fr: faq.answer_fr,
      it: faq.answer_it,
      es: faq.answer_es,
      ro: faq.answer_ro,
    };
    return answerMap[language] || faq.answer_en;
  };

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <section id="faq" className="py-12 xs:py-16 sm:py-20 lg:py-32 bg-[#0B0C0F]">
        <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return (
      <section id="faq" className="py-12 xs:py-16 sm:py-20 lg:py-32 bg-[#0B0C0F]">
        <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 xs:gap-3 mb-4 xs:mb-6">
              <HelpCircle className="w-7 xs:w-8 h-7 xs:h-8 sm:w-10 sm:h-10 text-[#D4AF37]" />
              <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {t('faq.title')}
              </h2>
            </div>
            <div className="w-20 xs:w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-4 xs:mb-6" />
            <p className="text-[#9AA0A6] text-base xs:text-lg sm:text-xl max-w-3xl mx-auto mb-6 xs:mb-8 px-2">
              {t('faq.subtitle')}
            </p>
            <div className="card-luxury p-6 xs:p-8 sm:p-12 max-w-2xl mx-auto">
              <p className="text-white text-base xs:text-lg mb-3 xs:mb-4">
                {language === 'de' && 'FAQ-Bereich wird bald verfügbar sein.'}
                {language === 'en' && 'FAQ section will be available soon.'}
                {language === 'fr' && 'La section FAQ sera bientôt disponible.'}
                {language === 'it' && 'La sezione FAQ sarà presto disponibile.'}
                {language === 'es' && 'La sección de preguntas frecuentes estará disponible pronto.'}
                {language === 'ro' && 'Secțiunea FAQ va fi disponibilă în curând.'}
              </p>
              <p className="text-[#9AA0A6] text-sm xs:text-base">
                {t('faq.stillHaveQuestions')}
                <a
                  href="#contact"
                  className="text-[#D4AF37] hover:text-[#F4D03F] transition-colors ml-1 underline underline-offset-4 touch-manipulation"
                  onClick={(e) => {
                    e.preventDefault();
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      const headerOffset = 100;
                      const elementPosition = contactSection.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.scrollY - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  {t('faq.contactUs')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-12 xs:py-16 sm:py-20 lg:py-32 bg-[#0B0C0F]">
      <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="text-center mb-8 xs:mb-10 sm:mb-16">
          <div className="flex items-center justify-center gap-2 xs:gap-3 mb-4 xs:mb-6">
            <HelpCircle className="w-7 xs:w-8 h-7 xs:h-8 sm:w-10 sm:h-10 text-[#D4AF37]" />
            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {t('faq.title')}
            </h2>
          </div>
          <div className="w-20 xs:w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-4 xs:mb-6" />
          <p className="text-[#9AA0A6] text-base xs:text-lg sm:text-xl max-w-3xl mx-auto px-2">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3 xs:space-y-4">
          {faqs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="card-luxury overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-300"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 xs:p-5 sm:p-8 flex items-start gap-3 xs:gap-4 text-left group min-h-touch touch-manipulation"
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div className="flex-shrink-0 mt-0.5 xs:mt-1">
                    <div className={`w-7 xs:w-8 h-7 xs:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isExpanded
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37]/20'
                    }`}>
                      {isExpanded ? (
                        <ChevronUp className="w-4 xs:w-5 h-4 xs:h-5" />
                      ) : (
                        <ChevronDown className="w-4 xs:w-5 h-4 xs:h-5" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 xs:gap-3 mb-1 xs:mb-2">
                      {faq.is_popular && (
                        <span className="px-2 xs:px-3 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                          {t('faq.popular')}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base xs:text-lg sm:text-xl font-bold transition-colors duration-300 ${
                      isExpanded ? 'text-[#D4AF37]' : 'text-white group-hover:text-[#D4AF37]'
                    }`}>
                      {getQuestion(faq)}
                    </h3>
                  </div>
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 xs:px-5 sm:px-8 pb-4 xs:pb-5 sm:pb-8 pl-14 xs:pl-16 sm:pl-20">
                    <div className="pt-3 xs:pt-4 border-t border-[#D4AF37]/20">
                      <p className="text-[#9AA0A6] text-sm xs:text-base leading-relaxed whitespace-pre-wrap">
                        {getAnswer(faq)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 xs:mt-10 sm:mt-12 text-center">
          <p className="text-[#9AA0A6] text-xs xs:text-sm sm:text-base">
            {t('faq.stillHaveQuestions')}
            <a
              href="#contact"
              className="text-[#D4AF37] hover:text-[#F4D03F] transition-colors ml-1 underline underline-offset-4 touch-manipulation"
              onClick={(e) => {
                e.preventDefault();
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  const headerOffset = 100;
                  const elementPosition = contactSection.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              {t('faq.contactUs')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
