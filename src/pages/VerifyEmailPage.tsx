import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-email-token`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
        setBookingId(data.booking_id || '');
        return;
      }

      setStatus('success');
      setMessage('Email verified successfully!');
      setBookingId(data.booking_id);

      setTimeout(() => {
        navigate(`/verify-card?booking_id=${data.booking_id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setStatus('error');
      setMessage(error.message || 'An error occurred during verification');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center p-6">
      <div className="card-luxury p-8 sm:p-12 max-w-lg w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader className="w-16 h-16 text-[#D4AF37] mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Verifying Your Email...
            </h1>
            <p className="text-[#9AA0A6]">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Email Verified Successfully!
            </h1>
            <p className="text-[#9AA0A6] mb-6">
              {message}
            </p>
            <p className="text-sm text-[#9AA0A6]">
              Redirecting to card verification...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Verification Failed
            </h1>
            <p className="text-[#9AA0A6] mb-6">
              {message}
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-3"
            >
              Back to Home
            </button>
          </>
        )}

        {bookingId && (
          <div className="mt-6 pt-6 border-t border-[#D4AF37]/20">
            <p className="text-xs text-[#9AA0A6]">
              Booking ID: <span className="text-white font-mono">{bookingId.slice(0, 8)}...</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
