import { Mail, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactSuccessModalProps {
  contactName: string;
  contactEmail: string;
  onClose: () => void;
}

export function ContactSuccessModal({
  contactName,
  contactEmail,
  onClose,
}: ContactSuccessModalProps) {
  const { t } = useLanguage();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-[#111316] border border-[#D4AF37]/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#D4AF37]/20 via-[#111316] to-[#111316] border-b border-[#D4AF37]/20 p-4 sm:p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
            aria-label={t['modal.close'] || 'Close'}
          >
            <X className="w-4 h-4 text-[#9AA0A6] group-hover:text-white transition-colors" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl rounded-full animate-pulse"></div>
              <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-full flex items-center justify-center">
                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-black" strokeWidth={2} />
              </div>
            </div>

            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-white mt-3 sm:mt-4 mb-1">
              {t['modal.contactMessageSent'] || 'Message Sent Successfully!'}
            </h2>

            <p className="text-[#9AA0A6] text-sm">
              {t['modal.contactSuccessMessage'] || 'Thank you for contacting us'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Contact Info Display */}
          <div className="bg-[#0B0C0F] border border-[#D4AF37]/30 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#9AA0A6] text-xs mb-0.5">{t['contact.yourName']}</p>
                <p className="text-white font-semibold text-sm">{contactName}</p>
              </div>
            </div>

            <div className="h-px bg-[#D4AF37]/20"></div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#9AA0A6] text-xs mb-0.5">{t['contact.yourEmail']}</p>
                <p className="text-white font-semibold text-sm break-all">{contactEmail}</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-green-200/90 leading-relaxed">
                <p className="font-semibold mb-1">
                  {t['modal.contactWillReply'] || 'We will contact you soon!'}
                </p>
                <p className="text-green-200/70 text-xs">
                  {t['modal.contactReplyTime'] || 'Our team typically responds within 24 hours. Check your email for our reply.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-200"
          >
            {t['modal.close'] || 'Close'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
