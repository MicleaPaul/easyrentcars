import { CheckCircle, X, TestTube, Calendar, CreditCard, Hash, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingSuccessModalProps {
  bookingId: string;
  isTestMode?: boolean;
  paymentMethod?: string;
  onClose: () => void;
}

export function BookingSuccessModal({
  bookingId,
  isTestMode = false,
  paymentMethod = 'skipped',
  onClose,
}: BookingSuccessModalProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleViewDetails = () => {
    onClose();
    navigate(`/booking-success?bookingId=${bookingId}`);
  };

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
              <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-[#D4AF37] relative z-10 drop-shadow-lg" strokeWidth={1.5} />
            </div>

            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-white mt-3 sm:mt-4 mb-1">
              {isTestMode ? (
                <span className="flex items-center justify-center gap-2">
                  <TestTube className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t['modal.testBookingCreated'] || 'TEST BOOKING CREATED'}
                </span>
              ) : (
                t['modal.bookingConfirmed'] || 'Booking Confirmed!'
              )}
            </h2>

            <p className="text-[#9AA0A6] text-sm">
              {t['modal.bookingSuccessMessage'] || 'Your booking has been successfully created'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Booking ID Display */}
          <div className="bg-[#0B0C0F] border border-[#D4AF37]/30 rounded-xl p-3 sm:p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#9AA0A6] text-xs font-medium">
              <Hash className="w-3.5 h-3.5" />
              <span>{t['modal.bookingId'] || 'Booking ID'}</span>
            </div>
            <div className="font-mono text-[#D4AF37] text-base sm:text-lg font-bold tracking-wider break-all">
              {bookingId}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div className="bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[#9AA0A6] text-xs mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t['modal.status'] || 'Status'}</span>
              </div>
              <div className="text-white font-semibold text-sm">
                {isTestMode ? (
                  <span className="text-yellow-500">{t['modal.testMode'] || 'Test Mode'}</span>
                ) : (
                  <span className="text-green-500">{t['modal.confirmed'] || 'Confirmed'}</span>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[#9AA0A6] text-xs mb-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t['modal.payment'] || 'Payment'}</span>
              </div>
              <div className="text-white font-semibold text-sm">
                {paymentMethod === 'cash' && (t['modal.cash'] || 'Cash')}
                {paymentMethod === 'stripe' && (t['modal.card'] || 'Card')}
                {paymentMethod === 'skipped' && (t['modal.skipped'] || 'Skipped')}
              </div>
            </div>
          </div>

          {/* Test Mode Notice */}
          {isTestMode && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <TestTube className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-yellow-200/90 leading-relaxed">
                  <p className="font-semibold mb-1">{t['modal.testModeNotice'] || 'Test Mode Active'}</p>
                  <p className="text-yellow-200/70 text-xs">
                    {t['modal.testModeDescription'] || 'This booking was created in test mode and will be marked accordingly. Email notifications will still be sent.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-200 text-xs sm:text-sm text-center leading-relaxed">
              {t['modal.emailConfirmationSent'] || 'A confirmation email has been sent to your email address with all the booking details.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>{t['modal.viewBookingDetails'] || 'View Booking Details'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0B0C0F] border border-[#D4AF37]/30 text-white font-semibold text-sm rounded-lg hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-200"
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
