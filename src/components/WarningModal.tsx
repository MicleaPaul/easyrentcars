import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WarningModalProps {
  title?: string;
  message: string;
  onClose: () => void;
}

export function WarningModal({
  title,
  message,
  onClose,
}: WarningModalProps) {
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
      aria-labelledby="warning-modal-title"
    >
      <div
        className="bg-[#111316] border border-yellow-500/30 rounded-2xl w-full max-w-md shadow-2xl transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-yellow-500/20 via-[#111316] to-[#111316] border-b border-yellow-500/20 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
            aria-label={t('modal.close') || 'Close'}
          >
            <X className="w-5 h-5 text-[#9AA0A6] group-hover:text-white transition-colors" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full animate-pulse"></div>
              <AlertTriangle className="w-16 h-16 text-yellow-500 relative z-10 drop-shadow-lg" strokeWidth={1.5} />
            </div>

            <h2 id="warning-modal-title" className="text-2xl font-bold text-white mt-4">
              {title || t('modal.warning') || 'Warning'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm leading-relaxed text-center">
              {message}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-yellow-500/20">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-200"
          >
            {t('modal.understood') || 'Understood'}
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
