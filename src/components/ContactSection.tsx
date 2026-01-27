import { useState } from 'react';
import { MapPin, Phone, Mail, Send, Clock, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ContactSuccessModal } from './ContactSuccessModal';
import { ErrorModal } from './ErrorModal';

export function ContactSection() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState({ name: '', email: '' });

  const contactInfo = settings.contact_info || {
    phone: '+43 664 158 4950',
    email: 'info@easyrentcars.rentals',
    address: { street: 'Alte Poststraße 286', city: 'Graz', postalCode: '8053', country: 'Austria' }
  };

  const businessHours = settings.business_hours || {
    weekday: { opens: '09:00', closes: '18:00' },
    weekend: { opens: '10:00', closes: '16:00' }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            language: t('lang'),
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmittedData({ name: formData.name, email: formData.email });
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage(t('contact.errorMessage') || 'Failed to send message. Please try again or contact us directly.');
      setShowErrorModal(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-12 xs:py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-[#111316] to-[#0B0C0F]">
      <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="text-center mb-8 xs:mb-10 sm:mb-16">
          <h2 className="font-bold text-white mb-4 xs:mb-6">
            {t('contact.title')}
          </h2>
          <div className="w-16 xs:w-20 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] mx-auto mb-6 xs:mb-8" />
          <p className="text-[#9AA0A6] max-w-2xl mx-auto text-sm xs:text-base px-2">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xs:gap-6 lg:gap-12">
          <div className="space-y-4 xs:space-y-6">
            <div className="card-luxury p-4 xs:p-5 sm:p-8">
              <h3 className="text-xl xs:text-2xl font-bold text-white mb-4 xs:mb-6">{t('contact.info')}</h3>

              <div className="space-y-4 xs:space-y-6">
                <div className="flex items-start gap-3 xs:gap-4">
                  <div className="w-10 xs:w-12 h-10 xs:h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 xs:w-6 h-5 xs:h-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold mb-0.5 xs:mb-1 text-sm xs:text-base">{t('contact.address')}</p>
                    <p className="text-[#9AA0A6] text-xs xs:text-sm">
                      {contactInfo.address?.street}<br />
                      {contactInfo.address?.postalCode} {contactInfo.address?.city}, {contactInfo.address?.country}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 xs:gap-4 p-2 -m-2 rounded-lg active:bg-white/5 transition-colors touch-manipulation"
                >
                  <div className="w-10 xs:w-12 h-10 xs:h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 xs:w-6 h-5 xs:h-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold mb-0.5 xs:mb-1 text-sm xs:text-base">{t('contact.phone')}</p>
                    <p className="text-[#9AA0A6] hover:text-[#D4AF37] transition-colors text-xs xs:text-sm">
                      {contactInfo.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-3 xs:gap-4 p-2 -m-2 rounded-lg active:bg-white/5 transition-colors touch-manipulation"
                >
                  <div className="w-10 xs:w-12 h-10 xs:h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 xs:w-6 h-5 xs:h-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold mb-0.5 xs:mb-1 text-sm xs:text-base">{t('contact.email')}</p>
                    <p className="text-[#9AA0A6] hover:text-[#D4AF37] transition-colors text-xs xs:text-sm break-all">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-3 xs:gap-4">
                  <div className="w-10 xs:w-12 h-10 xs:h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 xs:w-6 h-5 xs:h-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold mb-0.5 xs:mb-1 text-sm xs:text-base">{t('contact.hours')}</p>
                    <p className="text-[#9AA0A6] text-xs xs:text-sm">
                      Mon-Fri: {formatTime(businessHours.weekday.opens)} - {formatTime(businessHours.weekday.closes)}<br />
                      Sat-Sun: {formatTime(businessHours.weekend.opens)} - {formatTime(businessHours.weekend.closes)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-luxury p-4 xs:p-5 sm:p-8">
            <h3 className="text-xl xs:text-2xl font-bold text-white mb-4 xs:mb-6">{t('contact.sendMessage')}</h3>

            <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
              <div>
                <label className="block text-[#9AA0A6] text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">
                  {t('contact.yourName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 xs:px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[48px] touch-manipulation"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">
                  {t('contact.yourEmail')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 xs:px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[48px] touch-manipulation"
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">
                  {t('contact.yourPhone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 xs:px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[48px] touch-manipulation"
                  placeholder={t('contact.phonePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-xs xs:text-sm font-medium mb-1.5 xs:mb-2">
                  {t('contact.yourMessage')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 xs:px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none min-h-[120px] touch-manipulation"
                  placeholder={t('contact.messagePlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full btn-primary py-3.5 xs:py-4 text-sm xs:text-base uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation active:scale-[0.98] transition-transform"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 xs:w-5 h-4 xs:h-5 animate-spin" />
                    {t('contact.sending')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 xs:w-5 h-4 xs:h-5" />
                    {t('contact.send')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <ContactSuccessModal
          contactName={submittedData.name}
          contactEmail={submittedData.email}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {showErrorModal && (
        <ErrorModal
          title={t('modal.error') || 'Error'}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </section>
  );
}
