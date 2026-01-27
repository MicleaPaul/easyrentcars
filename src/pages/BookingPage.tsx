import { useState } from 'react';
import { ArrowLeft, CreditCard, Banknote, Shield, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingPageProps {
  carId: string;
  pickupDate: string;
  dropoffDate: string;
  onBack: () => void;
  onComplete: () => void;
}

export function BookingPage({ carId, pickupDate, dropoffDate, onBack, onComplete }: BookingPageProps) {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    notes: '',
  });

  const car = {
    brand: 'Audi',
    model: 'Q3',
    price_per_day: 98,
    minimum_age: 25,
  };

  const calculateDays = () => {
    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  };

  const days = calculateDays();
  const total = days * car.price_per_day;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'card') {
        alert('Stripe integration will be implemented here');
      } else {
        alert('Cash payment booking confirmed. You will receive a confirmation email.');
        onComplete();
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold uppercase tracking-wide text-sm">Back</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Complete Your <span className="text-gradient">Booking</span>
          </h1>
          <p className="text-[#9AA0A6]">Fill in your details to reserve your vehicle</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card-luxury p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="+43 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min={car.minimum_age}
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      Driving Experience (Years) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none"
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>

              <div className="card-luxury p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mb-3 ${
                      paymentMethod === 'card' ? 'text-[#D4AF37]' : 'text-[#9AA0A6]'
                    }`} />
                    <p className="text-white font-semibold mb-1">Credit Card</p>
                    <p className="text-xs text-[#9AA0A6]">Pay securely with Stripe</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <Banknote className={`w-8 h-8 mb-3 ${
                      paymentMethod === 'cash' ? 'text-[#D4AF37]' : 'text-[#9AA0A6]'
                    }`} />
                    <p className="text-white font-semibold mb-1">Cash</p>
                    <p className="text-xs text-[#9AA0A6]">Pay on pick-up</p>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                    <p className="text-sm text-[#9AA0A6]">
                      <Shield className="w-4 h-4 inline mr-2 text-[#D4AF37]" />
                      Secure payment processing with Stripe. Your card details are encrypted.
                    </p>
                  </div>
                )}
              </div>

              <div className="card-luxury p-6 sm:p-8">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-[#D4AF37]/40 bg-[#0B0C0F] checked:bg-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                  <span className="text-sm text-[#9AA0A6] group-hover:text-[#F5F7FA] transition-colors">
                    I accept the{' '}
                    <a href="#" className="text-[#D4AF37] hover:text-[#F4D03F] underline">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-[#D4AF37] hover:text-[#F4D03F] underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full btn-primary py-5 text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Booking
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="card-luxury p-6 sm:p-8 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-[#D4AF37]/20">
                <div>
                  <p className="text-xs text-[#9AA0A6] mb-1">Vehicle</p>
                  <p className="text-white font-semibold">{car.brand} {car.model}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#9AA0A6] mb-1">Pick-up</p>
                    <p className="text-white font-semibold text-sm">
                      {new Date(pickupDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6] mb-1">Drop-off</p>
                    <p className="text-white font-semibold text-sm">
                      {new Date(dropoffDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#9AA0A6] mb-1">Duration</p>
                  <p className="text-white font-semibold">{days} {days === 1 ? 'Day' : 'Days'}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9AA0A6]">Rental ({days} days)</span>
                  <span className="text-white font-semibold">€{total}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">Total</span>
                  <span className="text-3xl font-bold text-gradient">€{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
