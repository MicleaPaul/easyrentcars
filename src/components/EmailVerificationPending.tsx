import { useState, useEffect } from 'react';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface EmailVerificationPendingProps {
  email: string;
  bookingId: string;
  onResend: () => Promise<void>;
}

export function EmailVerificationPending({ email, bookingId, onResend }: EmailVerificationPendingProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(1200);
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResend = async () => {
    if (resendCount >= 2) {
      alert('Maximum resend attempts reached. Please wait or contact support.');
      return;
    }

    setResending(true);
    try {
      await onResend();
      setResendCount(prev => prev + 1);
      setTimeLeft(1200);
      alert('Verification email resent successfully!');
    } catch (error) {
      console.error('Failed to resend email:', error);
      alert('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center p-6">
      <div className="card-luxury p-8 sm:p-12 max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
            <Mail className="w-10 h-10 text-[#D4AF37]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Check Your <span className="text-gradient">Email</span>
          </h1>

          <p className="text-[#9AA0A6] text-lg mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-white font-semibold text-xl mb-6">
            {email}
          </p>
        </div>

        <div className="bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-white font-semibold">
              Time Remaining: <span className="text-[#D4AF37]">{formatTime(timeLeft)}</span>
            </span>
          </div>

          <div className="text-sm text-[#9AA0A6] space-y-2">
            <p>Click the verification link in the email to continue.</p>
            <p>The link will expire in 20 minutes.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[#9AA0A6] text-sm">
            Didn't receive the email? Check your spam folder or:
          </p>

          <button
            onClick={handleResend}
            disabled={resending || resendCount >= 2 || timeLeft === 0}
            className="btn-secondary px-6 py-3 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending...' : `Resend Email ${resendCount > 0 ? `(${2 - resendCount} left)` : ''}`}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-[#D4AF37]/20">
          <p className="text-sm text-[#9AA0A6]">
            Booking ID: <span className="text-white font-mono">{bookingId.slice(0, 8)}...</span>
          </p>
          <p className="text-xs text-[#9AA0A6] mt-2">
            Need help? Contact us at{' '}
            <a href="mailto:support@easyrentcars.com" className="text-[#D4AF37] hover:text-[#F4D03F]">
              support@easyrentcars.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
