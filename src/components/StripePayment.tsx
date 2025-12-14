import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface StripePaymentProps {
  amount: number;
  bookingDetails: {
    booking_id: string;
    vehicle_brand: string;
    vehicle_model: string;
    customer_name: string;
    customer_email: string;
    pickup_date: string;
    return_date: string;
    rental_days: number;
    price_per_day: number;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function StripePayment({ amount, bookingDetails, onSuccess, onError }: StripePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            bookingDetails,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      onSuccess(paymentIntentId);
    } catch (error: any) {
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="mt-6 p-6 rounded-lg bg-[#0B0C0F] border border-[#D4AF37]/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="text-white font-bold">Card Payment</h3>
          <p className="text-xs text-[#9AA0A6]">Secure payment with Stripe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            required
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full bg-[#111316] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
            Card Number
          </label>
          <input
            type="text"
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className="w-full bg-[#111316] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-mono"
            placeholder="4242 4242 4242 4242"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              required
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              className="w-full bg-[#111316] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-mono"
              placeholder="MM/YY"
            />
          </div>

          <div>
            <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
              CVC
            </label>
            <input
              type="text"
              required
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
              maxLength={4}
              className="w-full bg-[#111316] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-mono"
              placeholder="123"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center gap-2 text-xs text-[#9AA0A6]">
          <Lock className="w-4 h-4 text-[#D4AF37]" />
          <p>Your payment information is encrypted and secure</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 text-base uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay €${amount.toFixed(2)}`}
        </button>
      </form>

      <div className="mt-4 p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
        <p className="text-xs text-[#9AA0A6] text-center">
          Test Card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
        </p>
      </div>
    </div>
  );
}
