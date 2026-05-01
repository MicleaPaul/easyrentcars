import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Shield, CheckCircle, Clock, AlertCircle, Info, Lock, Package, Navigation, Users, Fuel, Baby, Globe, Wifi, Car as CarIcon, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import { supabase } from '../lib/supabase';
import { LocationPicker } from '../components/LocationPicker';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { checkVehicleAvailability } from '../lib/availabilityChecker';
import { ErrorModal } from '../components/ErrorModal';
import { WarningModal } from '../components/WarningModal';
import { SEOHead } from '../components/SEOHead';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  price_per_day: number;
  minimum_age: number;
}

interface BookingExtra {
  id: string;
  name_de: string;
  name_en: string;
  name_fr: string;
  name_it: string;
  name_es: string;
  name_ro: string;
  description_de: string;
  description_en: string;
  description_fr: string;
  description_it: string;
  description_es: string;
  description_ro: string;
  price: number;
  price_type: 'per_day' | 'one_time';
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const extraIconMap: Record<string, any> = {
  Package,
  Navigation,
  Users,
  Fuel,
  Baby,
  Globe,
  Wifi,
  Shield,
  Car: CarIcon,
};

interface BookingPageNewProps {
  onBack: () => void;
}

export function BookingPageNew({ onBack }: BookingPageNewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const {
    pickupLocation,
    setPickupLocation,
    returnLocation,
    setReturnLocation,
    pickupDate,
    returnDate,
    pickupTime,
    setPickupTime,
    returnTime,
    setReturnTime,
    contractNumber,
    setContractNumber,
    getTotalLocationFees
  } = useBooking();
  const [car, setCar] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('cash');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showContractTooltip, setShowContractTooltip] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    address: '',
    notes: '',
  });

  const [bookingExtras, setBookingExtras] = useState<BookingExtra[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());
  const [detailsExtra, setDetailsExtra] = useState<BookingExtra | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCarDetails(carId: string) {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('id, brand, model, year, transmission, fuel_type, seats, price_per_day, minimum_age')
          .eq('id', carId)
          .maybeSingle();

        if (cancelled) return;

        if (error) throw error;
        if (data) {
          setCar(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching car details:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchCarDetails(id);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function fetchExtras() {
      try {
        const { data, error } = await supabase
          .from('booking_extras')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (cancelled) return;
        if (error) {
          console.error('Error fetching extras:', error);
          return;
        }
        setBookingExtras((data || []) as BookingExtra[]);
      } catch (err) {
        if (!cancelled) console.error(err);
      }
    }
    fetchExtras();
    return () => { cancelled = true; };
  }, []);

  const PICKUP_MAX_HOUR = 18;

  useEffect(() => {
    if (!pickupTime) return;
    const [h] = pickupTime.split(':').map(Number);
    if (h > PICKUP_MAX_HOUR) {
      setPickupTime('18:00');
    }
  }, [pickupTime, setPickupTime]);

  const businessHours = settings.business_hours || {};
  const weekdayOpens = parseInt((businessHours.weekday?.opens || '07:00').split(':')[0]);
  const weekdayCloses = parseInt((businessHours.weekday?.closes || '21:00').split(':')[0]);
  const minHour = Math.min(weekdayOpens, parseInt((businessHours.weekend?.opens || '07:00').split(':')[0]));
  const maxHour = Math.max(weekdayCloses, parseInt((businessHours.weekend?.closes || '20:00').split(':')[0]));

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < maxHour) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();
  const pickupTimeOptions = timeOptions.filter((t) => {
    const [h, m] = t.split(':').map(Number);
    return h < PICKUP_MAX_HOUR || (h === PICKUP_MAX_HOUR && m === 0);
  });

  const afterHoursFeeAmount = settings.after_hours_fee?.amount || 30;

  const isAfterHours = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour < minHour || hour > maxHour;
  };

  const calculateAfterHoursFee = () => {
    const afterHoursPickup = isAfterHours(pickupTime);
    const afterHoursReturn = isAfterHours(returnTime);
    return (afterHoursPickup || afterHoursReturn) ? afterHoursFeeAmount : 0;
  };

  const calculateDays = () => {
    if (!pickupDate || !returnDate) return { days: 0, hasExtraDay: false, isSameDay: false, hours: 0 };
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const baseDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
    const [returnHour, returnMinute] = returnTime.split(':').map(Number);
    const pickupMinutes = pickupHour * 60 + pickupMinute;
    const returnMinutes = returnHour * 60 + returnMinute;

    const isSameDay = baseDays === 0;

    if (isSameDay) {
      const hours = Math.max(1, Math.round((returnMinutes - pickupMinutes) / 60));
      return { days: 1, hasExtraDay: false, isSameDay: true, hours };
    }

    const hasExtraDay = returnMinutes > pickupMinutes;
    const totalDays = hasExtraDay ? baseDays + 1 : baseDays;

    return { days: totalDays, hasExtraDay, isSameDay: false, hours: 0 };
  };

  const { days, hasExtraDay, isSameDay, hours } = calculateDays();
  const locationFees = getTotalLocationFees();
  const afterHoursFee = calculateAfterHoursFee();
  const cleaningFeeAmount = settings.cleaning_fee?.amount || 7;
  const cleaningFee = cleaningFeeAmount;
  const rentalCost = car ? days * car.price_per_day : 0;

  const selectedExtras = bookingExtras.filter((e) => selectedExtraIds.has(e.id));
  const extrasCost = selectedExtras.reduce((sum, e) => {
    const price = Number(e.price);
    return sum + (e.price_type === 'per_day' ? price * days : price);
  }, 0);

  const total = rentalCost + cleaningFee + locationFees + afterHoursFee + extrasCost;
  const DEPOSIT_AMOUNT = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setWarningMessage(t('modal.warning') || 'Please accept the terms and conditions');
      setShowWarningModal(true);
      return;
    }

    if (!car || !id) {
      setErrorMessage(t('modal.error') || 'Vehicle information is missing');
      setShowErrorModal(true);
      return;
    }

    if (!pickupLocation || !returnLocation) {
      setWarningMessage(t('modal.warning') || 'Please select pickup and return locations');
      setShowWarningModal(true);
      return;
    }

    if (!pickupDate || !returnDate) {
      setWarningMessage(t('modal.warning') || 'Please select pickup and return dates');
      setShowWarningModal(true);
      return;
    }

    if (pickupDate === returnDate) {
      const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
      const [returnHour, returnMinute] = returnTime.split(':').map(Number);
      const pickupMinutes = pickupHour * 60 + pickupMinute;
      const returnMinutes = returnHour * 60 + returnMinute;

      if (returnMinutes <= pickupMinutes) {
        setWarningMessage(t('bookingPage.returnTimeMustBeGreater'));
        setShowWarningModal(true);
        return;
      }
    }

    setSubmitting(true);

    try {
      const availabilityResult = await checkVehicleAvailability(id, pickupDate, returnDate);

      if (!availabilityResult.isAvailable) {
        let message: string;

        if (availabilityResult.reason?.includes('Database error')) {
          message = t('availability.checkError') || 'An error occurred while checking availability. Please try again.';
        } else if (availabilityResult.conflictType === 'booking') {
          message = t('availability.justBooked') || 'Sorry, this vehicle was just booked by someone else. Please choose different dates or another vehicle.';
        } else {
          message = t('availability.vehicleBlocked') || 'This vehicle is not available for the selected period. Please choose different dates or another vehicle.';
        }

        setErrorMessage(message);
        setShowErrorModal(true);
        setSubmitting(false);
        return;
      }

      const guestToken = crypto.randomUUID();

      const bookingData = {
        vehicle_id: id,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_age: parseInt(formData.age),
        customer_address: formData.address,
        pickup_date: pickupDate,
        return_date: returnDate,
        pickup_time: pickupTime,
        return_time: returnTime,
        pickup_location: pickupLocation?.name || 'Unknown',
        return_location: returnLocation?.name || 'Unknown',
        pickup_location_address: pickupLocation?.isCustom ? pickupLocation.address : null,
        return_location_address: returnLocation?.isCustom ? returnLocation.address : null,
        pickup_fee: pickupLocation?.fee || 0,
        return_fee: returnLocation?.fee || 0,
        contract_number: contractNumber || null,
        notes: formData.notes || null,
        language: language,
        guest_link_token: guestToken,
        payment_method: paymentMethod,
        rental_days: days,
        rental_cost: rentalCost,
        cleaning_fee: cleaningFee,
        location_fees: locationFees,
        after_hours_fee: afterHoursFee,
        total_amount: total,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookingData,
            success_url: `${window.location.origin}/booking-success`,
            cancel_url: `${window.location.origin}/booking/${id}`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Checkout error:', error);

        let errorMsg = t('bookingPage.checkoutError') || 'An error occurred while processing your booking.';

        if (error.error?.includes('Vehicle')) {
          errorMsg = t('availability.vehicleBlocked') || error.error;
        } else if (error.error?.includes('available')) {
          errorMsg = t('availability.alreadyBooked') || error.error;
        }

        throw new Error(errorMsg);
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error(t('bookingPage.checkoutError') || 'Failed to create checkout session');
      }

      window.location.href = url;
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMsg = error.message || t('bookingPage.checkoutError') || 'An error occurred while creating your booking.';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
          <div className="text-center text-[#9AA0A6] py-12">{t('bookingPage.loading')}</div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold uppercase tracking-wide text-sm">{t('bookingPage.back')}</span>
          </button>
          <div className="text-center text-[#9AA0A6] py-12">{t('bookingPage.notFound')}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Complete Your Booking - Car Rental Graz | EasyRentCars"
        description="Complete your car rental booking in Graz. Secure payment and instant confirmation. Book your vehicle with EasyRentCars today."
        noindex={true}
      />
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold uppercase tracking-wide text-sm">{t('bookingPage.back')}</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            {t('bookingPage.completeYour')} <span className="text-gradient">{t('bookingPage.booking')}</span>
          </h1>
          <p className="text-[#9AA0A6]">{t('bookingPage.fillDetails')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card-luxury p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">{t('bookingPage.personalInfo')}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      {t('bookingPage.fullName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder={t('bookingPage.fullNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      {t('bookingPage.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder={t('bookingPage.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      {t('bookingPage.phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder={t('bookingPage.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                      {t('bookingPage.age')} *
                    </label>
                    <input
                      type="number"
                      required
                      min={car.minimum_age}
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder={t('bookingPage.agePlaceholder', { age: car.minimum_age })}
                    />
                  </div>

                </div>

                <div className="mt-4">
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                    {t('bookingPage.address')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                    placeholder={t('bookingPage.addressPlaceholder')}
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-[#9AA0A6] text-sm font-medium">
                        {t('bookingPage.contractNumber') || 'Contract Number (Optional)'}
                      </label>
                      <button
                        type="button"
                        onMouseEnter={() => setShowContractTooltip(true)}
                        onMouseLeave={() => setShowContractTooltip(false)}
                        onClick={() => setShowContractTooltip(!showContractTooltip)}
                        className="relative text-[#D4AF37] hover:text-[#F4D03F] transition-colors"
                      >
                        <Info className="w-4 h-4" />
                        {showContractTooltip && (
                          <div className="absolute bottom-full left-0 mb-2 w-80 p-4 bg-[#0B0C0F] border border-[#D4AF37]/30 rounded-lg shadow-xl z-10">
                            <p className="text-white font-semibold text-sm mb-2">
                              {t('bookingPage.contractTooltipTitle') || 'For Business Clients'}
                            </p>
                            <p className="text-xs text-[#9AA0A6] leading-relaxed mb-2">
                              {t('bookingPage.contractTooltip') || 'If you are a corporate client or have an existing contract with us, please enter your contract number here. This will help us process your booking faster and apply any contractual discounts.'}
                            </p>
                            <p className="text-xs text-[#D4AF37]">
                              {t('bookingPage.contractTooltipNote') || 'Leave blank if you are a private client.'}
                            </p>
                          </div>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      placeholder={t('bookingPage.contractNumberPlaceholder') || 'Ex: CORP-2024-1234'}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                    {t('bookingPage.additionalNotes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none"
                    placeholder={t('bookingPage.notesPlaceholder')}
                  />
                </div>
              </div>

              <div className="card-luxury p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">{t('bookingPage.pickupLocation')} & {t('bookingPage.returnLocation')}</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-3">{t('bookingPage.pickupLocation')}</h3>
                    <LocationPicker
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      label=""
                    />
                    <div className="mt-4">
                      <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                        {t('bookingPage.pickupTime')} *
                      </label>
                      <div className="relative">
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all appearance-none cursor-pointer"
                        >
                          {pickupTimeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#D4AF37]/20 pt-6">
                    <h3 className="text-white font-semibold text-lg mb-3">{t('bookingPage.returnLocation')}</h3>
                    <LocationPicker
                      value={returnLocation}
                      onChange={setReturnLocation}
                      label=""
                    />
                    <div className="mt-4">
                      <label className="block text-[#9AA0A6] text-sm font-medium mb-2">
                        {t('bookingPage.returnTime')} *
                      </label>
                      <div className="relative">
                        <select
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all appearance-none cursor-pointer"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
                      </div>
                      {pickupDate === returnDate && (() => {
                        const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
                        const [returnHour, returnMinute] = returnTime.split(':').map(Number);
                        const pickupMinutes = pickupHour * 60 + pickupMinute;
                        const returnMinutes = returnHour * 60 + returnMinute;
                        return returnMinutes <= pickupMinutes ? (
                          <p className="text-xs text-red-400 mt-2">
                            {t('booking.selectLaterTime')}
                          </p>
                        ) : (
                          <p className="text-xs text-blue-400 mt-2">
                            {t('booking.sameDayAllowed')}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {(isAfterHours(pickupTime) || isAfterHours(returnTime)) && (
                  <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-400 font-semibold text-sm mb-1">{t('bookingPage.afterHoursWarning')}</p>
                        <p className="text-amber-300/80 text-xs">{t('bookingPage.businessHours')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {bookingExtras.length > 0 && (
                <div className="card-luxury p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">{t('bookingPage.extrasTitle')}</h2>
                  <p className="text-sm text-[#9AA0A6] mb-6">{t('bookingPage.extrasSubtitle')}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bookingExtras.map((extra) => {
                      const name = (extra as any)[`name_${language}`] || extra.name_en || '';
                      const IconComp = extraIconMap[extra.icon] || Package;
                      const selected = selectedExtraIds.has(extra.id);
                      return (
                        <div
                          key={extra.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selected ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                selected ? 'bg-[#D4AF37]/20' : 'bg-[#0B0C0F]'
                              }`}>
                                <IconComp className={`w-5 h-5 ${selected ? 'text-[#D4AF37]' : 'text-[#9AA0A6]'}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold truncate">{name}</p>
                                <p className="text-xs text-[#9AA0A6] mt-0.5">
                                  EUR{Number(extra.price).toFixed(2)} {extra.price_type === 'per_day' ? t('bookingPage.extraPerDay') : t('bookingPage.extraOneTime')}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setDetailsExtra(extra)}
                                  className="text-xs text-[#D4AF37] hover:text-[#F4D03F] mt-1 inline-flex items-center gap-1"
                                >
                                  <Info className="w-3 h-3" />
                                  {t('bookingPage.extraDetails')}
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={selected}
                              onClick={() => {
                                setSelectedExtraIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(extra.id)) next.delete(extra.id);
                                  else next.add(extra.id);
                                  return next;
                                });
                              }}
                              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                                selected ? 'bg-[#D4AF37]' : 'bg-[#0B0C0F] border border-[#D4AF37]/30'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                  selected ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="card-luxury p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">{t('bookingPage.paymentMethod')}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mb-3 ${
                      paymentMethod === 'stripe' ? 'text-[#D4AF37]' : 'text-[#9AA0A6]'
                    }`} />
                    <p className="text-white font-semibold mb-1">{t('bookingPage.creditCard')}</p>
                    <p className="text-xs text-[#9AA0A6]">{t('bookingPage.creditCardDesc')}</p>
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
                    <p className="text-white font-semibold mb-1">{t('bookingPage.cash')}</p>
                    <p className="text-xs text-[#9AA0A6]">{t('bookingPage.cashDesc')}</p>
                  </button>
                </div>

                {paymentMethod === 'stripe' && (
                  <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-400 font-semibold text-sm mb-1">
                          {t('bookingPage.payNowFull') || 'Pay Full Amount Now'}
                        </p>
                        <p className="text-xs text-green-300/80">
                          {t('bookingPage.payNowFullDesc') || 'Secure payment via Stripe. Your booking will be instantly confirmed.'}
                        </p>
                        <p className="text-lg font-bold text-green-400 mt-2">
                          {t('bookingPage.amountToPay') || 'Amount to pay'}: EUR{total}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash' && car && (
                  <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-400 font-semibold text-sm mb-1">
                          {t('bookingPage.payDeposit') || 'Pay Deposit Now + Cash at Pickup'}
                        </p>
                        <p className="text-xs text-amber-300/80 mb-3">
                          {t('bookingPage.payDepositDesc') || 'Pay a 1-day deposit now to secure your booking. The remaining amount will be due in cash when you pick up the vehicle.'}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-amber-300">{t('bookingPage.depositNow') || 'Deposit now (1 day)'}</span>
                            <span className="text-amber-400 font-bold">EUR{car.price_per_day}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-300">{t('bookingPage.cashAtPickup') || 'Cash at pickup'}</span>
                            <span className="text-white font-bold">EUR{(total - car.price_per_day).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-amber-500/30 pt-2 mt-2 flex justify-between">
                            <span className="text-white font-semibold">{t('bookingPage.totalAmount') || 'Total amount'}</span>
                            <span className="text-[#D4AF37] font-bold">EUR{total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    {t('bookingPage.acceptTerms')}{' '}
                    <Link to="/agb" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-[#F4D03F] underline">
                      {t('bookingPage.termsAndConditions')}
                    </Link>{' '}
                    {t('bookingPage.and')}{' '}
                    <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-[#F4D03F] underline">
                      {t('bookingPage.privacyPolicy')}
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !acceptedTerms}
                className="w-full btn-primary py-5 text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  t('bookingPage.processing')
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('bookingPage.completeBooking')}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="card-luxury p-6 sm:p-8 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">{t('bookingPage.summary')}</h3>

              <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-white font-semibold">{t('bookingPage.deposit')}</p>
                      <p className="text-[#D4AF37] font-bold">{t('bookingPage.depositValue')}</p>
                    </div>
                    <p className="text-xs text-[#9AA0A6] mt-1 leading-relaxed">
                      {t('bookingPage.depositInfo')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-[#D4AF37]/20">
                <div>
                  <p className="text-xs text-[#9AA0A6] mb-1">{t('bookingPage.vehicle')}</p>
                  <p className="text-white font-semibold">{car.brand} {car.model}</p>
                  <p className="text-xs text-[#9AA0A6] mt-1">{car.year} - {car.transmission} - {car.fuel_type} - {car.seats} seats</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#9AA0A6] mb-1">{t('bookingPage.pickup')}</p>
                    <p className="text-white font-semibold text-sm">
                      {pickupDate ? new Date(pickupDate).toLocaleDateString() : '-'}
                    </p>
                    <p className="text-xs text-[#9AA0A6] mt-1">{pickupTime}</p>
                    {pickupLocation && (
                      <>
                        <p className="text-xs text-[#D4AF37] mt-1">{pickupLocation.name}</p>
                        {pickupLocation.address && (
                          <p className="text-xs text-[#F5F7FA] mt-1 italic">{pickupLocation.address}</p>
                        )}
                        {pickupLocation.fee > 0 && (
                          <p className="text-xs text-[#D4AF37] mt-1">+EUR{pickupLocation.fee}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6] mb-1">{t('bookingPage.dropoff')}</p>
                    <p className="text-white font-semibold text-sm">
                      {returnDate ? new Date(returnDate).toLocaleDateString() : '-'}
                    </p>
                    <p className="text-xs text-[#9AA0A6] mt-1">{returnTime}</p>
                    {returnLocation && (
                      <>
                        <p className="text-xs text-[#D4AF37] mt-1">{returnLocation.name}</p>
                        {returnLocation.address && (
                          <p className="text-xs text-[#F5F7FA] mt-1 italic">{returnLocation.address}</p>
                        )}
                        {returnLocation.fee > 0 && (
                          <p className="text-xs text-[#D4AF37] mt-1">+EUR{returnLocation.fee}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#9AA0A6] mb-1">{t('bookingPage.duration')}</p>
                  <p className="text-white font-semibold">{days} {days === 1 ? t('bookingPage.day') : t('bookingPage.days')}</p>
                  {isSameDay && hours > 0 && (
                    <div className="mt-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-300">
                          {t('bookingPage.sameDayNotice', { pickupTime, returnTime })}
                          {' '}({t('bookingPage.sameDayHours', { hours })})
                        </p>
                      </div>
                    </div>
                  )}
                  {!isSameDay && hasExtraDay && (
                    <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300">{t('bookingPage.extraDayNotice')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9AA0A6]">{t('bookingPage.rental')} ({days} {days === 1 ? t('bookingPage.day') : t('bookingPage.days')})</span>
                  <span className="text-white font-semibold">EUR{rentalCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9AA0A6]">{t('bookingPage.cleaningFee')}</span>
                  <span className="text-white font-semibold">EUR{cleaningFee}</span>
                </div>
                {locationFees > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9AA0A6]">{t('bookingPage.locationFee')}</span>
                    <span className="text-white font-semibold">EUR{locationFees}</span>
                  </div>
                )}
                {afterHoursFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9AA0A6]">{t('bookingPage.afterHoursFee')}</span>
                    <span className="text-white font-semibold">EUR{afterHoursFee}</span>
                  </div>
                )}
                {selectedExtras.map((extra) => {
                  const name = (extra as any)[`name_${language}`] || extra.name_en || '';
                  const price = Number(extra.price);
                  const line = extra.price_type === 'per_day' ? price * days : price;
                  return (
                    <div key={extra.id} className="flex justify-between text-sm">
                      <span className="text-[#9AA0A6]">{name} ({extra.price_type === 'per_day' ? `${days} x ${price.toFixed(2)}` : t('bookingPage.extraOneTime')})</span>
                      <span className="text-white font-semibold">EUR{line.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">{t('bookingPage.total')}</span>
                  <span className="text-3xl font-bold text-gradient">EUR{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {detailsExtra && (() => {
        const name = (detailsExtra as any)[`name_${language}`] || detailsExtra.name_en || '';
        const desc = (detailsExtra as any)[`description_${language}`] || detailsExtra.description_en || '';
        const IconComp = extraIconMap[detailsExtra.icon] || Package;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDetailsExtra(null)}>
            <div className="bg-[#111316] border border-[#D4AF37]/30 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                    <IconComp className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{name}</h3>
                </div>
                <button onClick={() => setDetailsExtra(null)} className="text-[#9AA0A6] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#D4AF37] font-semibold mb-3">
                EUR{Number(detailsExtra.price).toFixed(2)} {detailsExtra.price_type === 'per_day' ? t('bookingPage.extraPerDay') : t('bookingPage.extraOneTime')}
              </p>
              <p className="text-sm text-[#B8B9BB] leading-relaxed mb-6 whitespace-pre-line">{desc}</p>
              <button
                onClick={() => setDetailsExtra(null)}
                className="w-full btn-primary py-3"
              >
                {t('bookingPage.extraClose')}
              </button>
            </div>
          </div>
        );
      })()}

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => {
            setShowErrorModal(false);
            setErrorMessage('');
          }}
        />
      )}

      {showWarningModal && (
        <WarningModal
          message={warningMessage}
          onClose={() => {
            setShowWarningModal(false);
            setWarningMessage('');
          }}
        />
      )}
      </div>
    </>
  );
}
