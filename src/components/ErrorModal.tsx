import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ErrorModalProps {
  title?: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorModal({
  title,
  message,
  onClose,
  onRetry,
  showRetry = false,
}: ErrorModalProps) {
  const { t } = useLanguage();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div
        className="bg-[#111316] border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-red-500/20 via-[#111316] to-[#111316] border-b border-red-500/20 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
            aria-label={t['modal.close'] || 'Close'}
          >
            <X className="w-5 h-5 text-[#9AA0A6] group-hover:text-white transition-colors" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse"></div>
              <AlertCircle className="w-16 h-16 text-red-500 relative z-10 drop-shadow-lg" strokeWidth={1.5} />
            </div>

            <h2 id="error-modal-title" className="text-2xl font-bold text-white mt-4">
              {title || t['modal.error'] || 'Error'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-200 text-sm leading-relaxed text-center">
              {message}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-red-500/20 flex flex-col sm:flex-row gap-3">
          {showRetry && onRetry && (
            <button
              onClick={handleRetry}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t['modal.tryAgain'] || 'Try Again'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`${showRetry && onRetry ? 'flex-1' : 'w-full'} px-6 py-3 bg-[#0B0C0F] border border-red-500/30 text-white font-semibold rounded-lg hover:bg-red-500/10 hover:border-red-500 transition-all duration-200`}
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
