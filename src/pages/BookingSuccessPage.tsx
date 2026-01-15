import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Car, Calendar, MapPin, User, Mail, Phone, Download, Home, Clock, CreditCard, Banknote, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { SEOHead } from '../components/SEOHead';

interface BookingDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  pickup_location_address: string | null;
  return_location_address: string | null;
  pickup_fee: number;
  return_fee: number;
  total_price: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  after_hours_fee: number;
  cleaning_fee: number;
  language: string;
  rental_days?: number;
  rental_cost?: number;
  deposit_amount?: number;
  remaining_amount?: number;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    transmission: string;
    fuel_type: string;
    price_per_day: number;
  };
}

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const bookingId = searchParams.get('booking_id');
  const sessionId = searchParams.get('session_id');

  const fetchBookingBySessionId = useCallback(async (stripeSessionId: string): Promise<BookingDetails | null> => {
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        pickup_location_address,
        return_location_address,
        pickup_fee,
        return_fee,
        total_price,
        payment_method,
        payment_status,
        booking_status,
        after_hours_fee,
        cleaning_fee,
        language,
        rental_days,
        rental_cost,
        deposit_amount,
        remaining_amount,
        vehicles (
          brand,
          model,
          year,
          transmission,
          fuel_type,
          price_per_day
        )
      `)
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!data) return null;

    const vehicleData = Array.isArray(data.vehicles) ? data.vehicles[0] : data.vehicles;
    return { ...data, vehicle: vehicleData };
  }, []);

  const fetchBookingById = useCallback(async (id: string): Promise<BookingDetails | null> => {
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        pickup_location_address,
        return_location_address,
        pickup_fee,
        return_fee,
        total_price,
        payment_method,
        payment_status,
        booking_status,
        after_hours_fee,
        cleaning_fee,
        language,
        rental_days,
        rental_cost,
        deposit_amount,
        remaining_amount,
        vehicles (
          brand,
          model,
          year,
          transmission,
          fuel_type,
          price_per_day
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!data) return null;

    const vehicleData = Array.isArray(data.vehicles) ? data.vehicles[0] : data.vehicles;
    return { ...data, vehicle: vehicleData };
  }, []);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        let bookingData: BookingDetails | null = null;

        if (sessionId) {
          bookingData = await fetchBookingBySessionId(sessionId);

          if (!bookingData && retryCount < 10) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
            return;
          }
        } else if (bookingId) {
          bookingData = await fetchBookingById(bookingId);
        } else {
          setError('No booking reference provided');
          setLoading(false);
          return;
        }

        if (!bookingData) {
          if (sessionId && retryCount >= 10) {
            setError('Booking is still being processed. Please check your email for confirmation.');
          } else {
            setError('Booking not found');
          }
          setLoading(false);
          return;
        }

        setBooking(bookingData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, sessionId, retryCount, fetchBookingBySessionId, fetchBookingById]);

  const calculateDays = () => {
    if (!booking) return 0;
    return booking.rental_days || 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-AT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-AT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-booking-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking_id: booking.id }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-${booking.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">
            {sessionId ? 'Processing your payment...' : 'Loading booking details...'}
          </p>
          {sessionId && retryCount > 0 && (
            <p className="text-[#9AA0A6] text-sm">
              Confirming your booking ({retryCount}/10)
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[800px]">
          <div className="card-luxury p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Booking Not Found</h1>
            <p className="text-[#9AA0A6] mb-6">{error || 'Unable to find your booking details'}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-3"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const days = calculateDays();
  const rentalCost = booking.rental_cost || 0;
  const locationFees = (booking.pickup_fee || 0) + (booking.return_fee || 0);
  const depositAmount = booking.deposit_amount || 0;
  const remainingAmount = booking.remaining_amount || 0;

  return (
    <>
      <SEOHead
        title="Booking Confirmed - EasyRentCars"
        description="Your car rental booking in Graz has been confirmed. Check your email for booking details."
        noindex={true}
      />
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[900px]">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('bookingSuccess.title') || 'Booking Confirmed!'}
          </h1>
          <p className="text-[#9AA0A6] text-lg">
            {t('bookingSuccess.subtitle') || 'Thank you for your reservation. A confirmation email has been sent to your email address.'}
          </p>
        </div>

        <div className="card-luxury p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#D4AF37]/20">
            <div>
              <p className="text-[#9AA0A6] text-sm mb-1">{t('bookingSuccess.bookingId') || 'Booking ID'}</p>
              <p className="text-white font-mono text-lg">{booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              booking.booking_status === 'Confirmed'
                ? 'bg-green-500/20 text-green-400'
                : booking.booking_status === 'PendingPayment'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {booking.booking_status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                  <Car className="w-5 h-5" />
                  <h3 className="font-semibold">{t('bookingSuccess.vehicle') || 'Vehicle'}</h3>
                </div>
                <p className="text-white text-xl font-bold">{booking.vehicle.brand} {booking.vehicle.model}</p>
                <p className="text-[#9AA0A6] text-sm mt-1">
                  {booking.vehicle.year} | {booking.vehicle.transmission} | {booking.vehicle.fuel_type}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                  <User className="w-5 h-5" />
                  <h3 className="font-semibold">{t('bookingSuccess.customer') || 'Customer Details'}</h3>
                </div>
                <p className="text-white font-semibold">{booking.customer_name}</p>
                <div className="flex items-center gap-2 text-[#9AA0A6] text-sm mt-1">
                  <Mail className="w-4 h-4" />
                  {booking.customer_email}
                </div>
                <div className="flex items-center gap-2 text-[#9AA0A6] text-sm mt-1">
                  <Phone className="w-4 h-4" />
                  {booking.customer_phone}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                  {booking.payment_method === 'stripe' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <Banknote className="w-5 h-5" />
                  )}
                  <h3 className="font-semibold">{t('bookingSuccess.payment') || 'Payment'}</h3>
                </div>
                <p className="text-white font-semibold capitalize">
                  {booking.payment_method === 'stripe' ? 'Credit Card' : 'Cash'}
                </p>
                <p className={`text-sm mt-1 ${
                  booking.payment_status === 'paid' || booking.payment_status === 'completed'
                    ? 'text-green-400'
                    : booking.payment_status === 'partial'
                    ? 'text-amber-400'
                    : 'text-[#9AA0A6]'
                }`}>
                  {booking.payment_status === 'paid' || booking.payment_status === 'completed'
                    ? 'Fully Paid'
                    : booking.payment_status === 'partial'
                    ? 'Deposit Paid'
                    : 'Pending'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-semibold">{t('bookingSuccess.pickup') || 'Pickup'}</h3>
                </div>
                <p className="text-white font-semibold">{formatDate(booking.pickup_date)}</p>
                <div className="flex items-center gap-2 text-[#9AA0A6] text-sm mt-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(booking.pickup_date)}
                </div>
                <div className="flex items-start gap-2 text-[#9AA0A6] text-sm mt-1">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {booking.pickup_location}
                    {booking.pickup_location_address && (
                      <span className="block text-[#F5F7FA] italic">{booking.pickup_location_address}</span>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-semibold">{t('bookingSuccess.return') || 'Return'}</h3>
                </div>
                <p className="text-white font-semibold">{formatDate(booking.return_date)}</p>
                <div className="flex items-center gap-2 text-[#9AA0A6] text-sm mt-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(booking.return_date)}
                </div>
                <div className="flex items-start gap-2 text-[#9AA0A6] text-sm mt-1">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {booking.return_location}
                    {booking.return_location_address && (
                      <span className="block text-[#F5F7FA] italic">{booking.return_location_address}</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-[#0B0C0F] rounded-lg p-4">
                <p className="text-[#9AA0A6] text-sm mb-1">{t('bookingSuccess.duration') || 'Duration'}</p>
                <p className="text-white text-2xl font-bold">{days} {days === 1 ? 'Day' : 'Days'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-luxury p-6 sm:p-8 mb-6">
          <h3 className="text-xl font-bold text-white mb-6">{t('bookingSuccess.priceBreakdown') || 'Price Breakdown'}</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#9AA0A6]">Rental ({days} {days === 1 ? 'day' : 'days'} x EUR{booking.vehicle.price_per_day})</span>
              <span className="text-white font-semibold">EUR{rentalCost}</span>
            </div>

            {booking.cleaning_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-[#9AA0A6]">Cleaning Fee</span>
                <span className="text-white font-semibold">EUR{booking.cleaning_fee}</span>
              </div>
            )}

            {locationFees > 0 && (
              <div className="flex justify-between">
                <span className="text-[#9AA0A6]">Location Fees</span>
                <span className="text-white font-semibold">EUR{locationFees}</span>
              </div>
            )}

            {booking.after_hours_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-[#9AA0A6]">After Hours Fee</span>
                <span className="text-white font-semibold">EUR{booking.after_hours_fee}</span>
              </div>
            )}

            <div className="border-t border-[#D4AF37]/20 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-3xl font-bold text-gradient">EUR{booking.total_price}</span>
              </div>
            </div>

            {booking.payment_method === 'cash' && depositAmount > 0 && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-amber-400">Deposit Paid (Online)</span>
                  <span className="text-amber-400 font-semibold">EUR{depositAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Due at Pickup (Cash)</span>
                  <span className="text-white font-bold text-xl">EUR{remainingAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card-luxury p-6 sm:p-8 mb-8 bg-[#D4AF37]/5 border-[#D4AF37]/30">
          <h3 className="text-lg font-bold text-white mb-4">{t('bookingSuccess.nextSteps') || 'What Happens Next?'}</h3>
          <ul className="space-y-3 text-[#9AA0A6]">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
              <span>{t('bookingSuccess.step1') || 'You will receive a confirmation email with all booking details and your rental contract.'}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
              <span>{t('bookingSuccess.step2') || 'Bring your valid driving license and ID/passport when picking up the vehicle.'}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
              <span>
                {booking.payment_method === 'cash'
                  ? (t('bookingSuccess.step3Cash') || 'Remaining amount to be paid in CASH at pickup.')
                  : (t('bookingSuccess.step3Card') || 'Full payment completed online. No additional payment required.')
                }
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            className="btn-primary px-8 py-4 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {t('bookingSuccess.downloadPDF') || 'Download Confirmation'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-lg border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t('bookingSuccess.backHome') || 'Back to Home'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#9AA0A6] text-sm">
            {t('bookingSuccess.questions') || 'Questions? Contact us at'}{' '}
            <a href="mailto:info@easyrentcars.rentals" className="text-[#D4AF37] hover:text-[#F4D03F]">
              info@easyrentcars.rentals
            </a>{' '}
            {t('bookingSuccess.orCall') || 'or call'}{' '}
            <a href="tel:+436704070707" className="text-[#D4AF37] hover:text-[#F4D03F]">
              +43 670 40 70 707
            </a>
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
