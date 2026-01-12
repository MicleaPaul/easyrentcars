import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X as XIcon, DollarSign, Fuel, MapPin, Clock, ArrowRight, AlertCircle, Lock, Trash2, Droplet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FuelLevelManager } from './FuelLevelManager';
import { FuelLevelQuickModal } from './FuelLevelQuickModal';
import { VehicleBlocksManagement } from './VehicleBlocksManagement';
import { useLanguage } from '../contexts/LanguageContext';

interface Booking {
  id: string;
  vehicle_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  pickup_location_address?: string | null;
  return_location_address?: string | null;
  total_price: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  stripe_payment_intent_id?: string;
  pickup_fuel_level?: number;
  return_fuel_level?: number;
  fuel_refund_due: boolean;
  fuel_charge_amount: number;
  after_hours_fee?: number;
  custom_location_fee?: number;
  notes?: string | null;
  created_at: string;
  deposit_amount?: number;
  remaining_amount?: number;
  paid_at?: string;
  deposit_paid_at?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
}

export function BookingsManagement() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [fuelModalBooking, setFuelModalBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'blocks'>('bookings');

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, brand, model');

      if (vehiclesError) throw vehiclesError;

      const vehiclesMap = vehiclesData.reduce((acc, v) => {
        acc[v.id] = v;
        return acc;
      }, {} as Record<string, Vehicle>);

      setVehicles(vehiclesMap);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || booking.booking_status === statusFilter;

    const matchesFuel = (() => {
      if (fuelFilter === 'all') return true;
      if (fuelFilter === 'not_set') return booking.pickup_fuel_level === undefined || booking.pickup_fuel_level === null;
      if (fuelFilter === 'pickup_only') return booking.pickup_fuel_level !== undefined && booking.pickup_fuel_level !== null && (booking.return_fuel_level === undefined || booking.return_fuel_level === null);
      if (fuelFilter === 'complete') return booking.pickup_fuel_level !== undefined && booking.pickup_fuel_level !== null && booking.return_fuel_level !== undefined && booking.return_fuel_level !== null;
      if (fuelFilter === 'low_return') return booking.pickup_fuel_level !== undefined && booking.return_fuel_level !== undefined && booking.return_fuel_level < booking.pickup_fuel_level;
      return true;
    })();

    return matchesSearch && matchesStatus && matchesFuel;
  });

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
      case 'pendingpayment':
      case 'pendingverification':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'confirmed':
        return 'bg-green-500/10 text-green-500';
      case 'active':
        return 'bg-blue-500/10 text-blue-500';
      case 'completed':
        return 'bg-gray-500/10 text-gray-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      case 'expired':
        return 'bg-gray-500/10 text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'paid':
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'partial':
        return 'bg-amber-500/10 text-amber-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const truncateLocation = (location: string, maxLength: number = 20) => {
    if (location.length <= maxLength) return location;
    return location.substring(0, maxLength) + '...';
  };

  const hasCustomLocation = (booking: Booking) => {
    return booking.pickup_location_address || booking.return_location_address;
  };

  const pendingApprovalCount = bookings.filter(
    (b) => (b.booking_status.toLowerCase() === 'pending' ||
            b.booking_status === 'PendingPayment' ||
            b.booking_status === 'PendingVerification') &&
           (b.payment_status === 'paid' || b.payment_status === 'completed')
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
              : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
          }`}
        >
          <Eye className="w-4 h-4" />
          {t('admin.reservations')}
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all flex items-center gap-2 ${
            activeTab === 'blocks'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
              : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
          }`}
        >
          <Lock className="w-4 h-4" />
          {t('admin.blocks')}
        </button>
      </div>

      {activeTab === 'bookings' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{t('admin.bookingsManagement')}</h2>
              {pendingApprovalCount > 0 && (
                <p className="text-[#D4AF37] text-sm">
                  {pendingApprovalCount} {pendingApprovalCount !== 1 ? t('admin.bookingsAwaitingApproval') : t('admin.bookingAwaitingApproval')}
                </p>
              )}
            </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder={t('admin.searchBookings')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0B0C0F] text-[#F5F7FA] pl-10 pr-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA0A6]" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B0C0F] text-[#F5F7FA] px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
          >
            <option value="all">{t('admin.allStatus')}</option>
            <option value="pending">{t('admin.pending')}</option>
            <option value="confirmed">{t('admin.confirmed')}</option>
            <option value="active">{t('admin.active')}</option>
            <option value="completed">{t('admin.completed')}</option>
            <option value="cancelled">{t('admin.cancelled')}</option>
          </select>
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="bg-[#0B0C0F] text-[#F5F7FA] px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all flex items-center gap-2"
          >
            <option value="all">🔥 {t('admin.allFuelStatus')}</option>
            <option value="not_set">⚠️ {t('admin.notSet')}</option>
            <option value="pickup_only">📤 {t('admin.pickupOnly')}</option>
            <option value="complete">✅ {t('admin.completeStatus')}</option>
            <option value="low_return">🔻 {t('admin.lowReturn')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[#9AA0A6] py-12">{t('admin.loadingBookings')}</div>
      ) : filteredBookings.length === 0 ? (
        <div className="card-luxury p-12 text-center">
          <p className="text-[#9AA0A6] text-lg">{t('admin.noBookingsFound')}</p>
        </div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0B0C0F]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.bookingId')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.customer')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.vehicle')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.dates')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.locations')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.total')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.payment')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.fuel')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredBookings.map((booking) => {
                  const vehicle = vehicles[booking.vehicle_id];
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-[#D4AF37]/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-white font-mono text-sm">
                          {booking.id.slice(0, 8)}...
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-semibold">
                            {booking.customer_name}
                          </p>
                          <p className="text-sm text-[#9AA0A6]">
                            {booking.customer_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-white">
                            {formatDate(booking.pickup_date)}
                          </p>
                          <p className="text-[#9AA0A6]">
                            {formatDate(booking.return_date)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm flex items-center gap-1">
                          {hasCustomLocation(booking) && (
                            <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-white text-xs">
                                {truncateLocation(booking.pickup_location, 15)}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#9AA0A6]" />
                              <span className="text-white text-xs">
                                {truncateLocation(booking.return_location, 15)}
                              </span>
                            </div>
                            {hasCustomLocation(booking) && (
                              <span className="text-[#D4AF37] text-xs mt-0.5">Custom</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">
                          €{booking.total_price.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                            booking.payment_status
                          )}`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.booking_status
                          )}`}
                        >
                          {booking.booking_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {booking.pickup_fuel_level !== undefined && booking.pickup_fuel_level !== null ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Fuel className="w-4 h-4 text-[#D4AF37]" />
                                <span className="text-white text-sm">{booking.pickup_fuel_level}%</span>
                                {booking.return_fuel_level !== undefined && booking.return_fuel_level !== null ? (
                                  <>
                                    <span className="text-[#9AA0A6]">→</span>
                                    <span className={`text-sm ${
                                      booking.return_fuel_level < booking.pickup_fuel_level
                                        ? 'text-red-500'
                                        : 'text-green-500'
                                    }`}>
                                      {booking.return_fuel_level}%
                                    </span>
                                  </>
                                ) : booking.booking_status === 'Active' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFuelModalBooking(booking);
                                    }}
                                    className="ml-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs rounded font-semibold hover:bg-orange-500/30 transition-colors"
                                  >
                                    {t('admin.setReturn')}
                                  </button>
                                ) : null}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFuelModalBooking(booking);
                                }}
                                className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
                              >
                                <Droplet className="w-3 h-3" />
                                {t('admin.manage')}
                              </button>
                            </div>
                          ) : (booking.booking_status === 'Confirmed' || booking.booking_status === 'PendingVerification' || booking.booking_status === 'PendingPayment') ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFuelModalBooking(booking);
                              }}
                              className="px-4 py-2 bg-blue-500/20 border-2 border-blue-500/60 text-blue-400 text-sm rounded-lg font-bold flex items-center gap-2 hover:bg-blue-500/40 hover:border-blue-500 transition-all shadow-lg"
                            >
                              <Fuel className="w-4 h-4" />
                              {t('admin.setPickup')}
                            </button>
                          ) : (
                            <span className="text-[#9AA0A6] text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-[#D4AF37]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          vehicle={vehicles[selectedBooking.vehicle_id]}
          onClose={() => setSelectedBooking(null)}
          onUpdate={fetchBookings}
        />
      )}

      {fuelModalBooking && (
        <FuelLevelQuickModal
          bookingId={fuelModalBooking.id}
          bookingStatus={fuelModalBooking.booking_status}
          customerName={fuelModalBooking.customer_name}
          vehicleName={vehicles[fuelModalBooking.vehicle_id] ? `${vehicles[fuelModalBooking.vehicle_id].brand} ${vehicles[fuelModalBooking.vehicle_id].model}` : 'Unknown'}
          pickupFuelLevel={fuelModalBooking.pickup_fuel_level}
          returnFuelLevel={fuelModalBooking.return_fuel_level}
          onClose={() => setFuelModalBooking(null)}
          onUpdate={fetchBookings}
        />
      )}
        </>
      )}

      {activeTab === 'blocks' && <VehicleBlocksManagement />}
    </div>
  );
}

interface BookingDetailModalProps {
  booking: Booking;
  vehicle?: Vehicle;
  onClose: () => void;
  onUpdate: () => void;
}

function BookingDetailModal({
  booking,
  vehicle,
  onClose,
  onUpdate,
}: BookingDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ booking_status: 'Confirmed' })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      setSuccess('Booking approved successfully!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to approve booking');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this booking? This will cancel the booking and initiate a refund if payment was made.')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ booking_status: 'Cancelled' })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      setSuccess('Booking rejected successfully!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reject booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(
      `ATENȚIE: Șterge PERMANENT această rezervare?\n\n` +
      `Client: ${booking.customer_name}\n` +
      `Vehicul: ${vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown'}\n` +
      `Perioada: ${formatDateTime(booking.pickup_date)} - ${formatDateTime(booking.return_date)}\n\n` +
      `Această acțiune NU poate fi anulată!\n\n` +
      `Sigur doriți să continuați?`
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (deleteError) throw deleteError;

      setSuccess('Rezervarea a fost ștearsă cu succes!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Eroare la ștergerea rezervării');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeFromDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAfterHours = (dateString: string) => {
    const hour = new Date(dateString).getHours();
    return hour < 7 || hour >= 20;
  };

  const calculateBaseCost = () => {
    const pickup = new Date(booking.pickup_date);
    const returnDate = new Date(booking.return_date);
    const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    const afterHours = booking.after_hours_fee || 0;
    const customFee = booking.custom_location_fee || 0;
    return booking.total_price - afterHours - customFee;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#111316] border border-[#D4AF37]/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#111316] border-b border-[#D4AF37]/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Booking Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-[#9AA0A6]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-[#9AA0A6] text-sm">Name</p>
                  <p className="text-white">{booking.customer_name}</p>
                </div>
                <div>
                  <p className="text-[#9AA0A6] text-sm">Email</p>
                  <p className="text-white">{booking.customer_email}</p>
                </div>
                <div>
                  <p className="text-[#9AA0A6] text-sm">Phone</p>
                  <p className="text-white">{booking.customer_phone}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-3">Vehicle Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-[#9AA0A6] text-sm">Vehicle</p>
                  <p className="text-white">
                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AA0A6] text-sm">Pickup Date</p>
                  <p className="text-white">{formatDateTime(booking.pickup_date)}</p>
                </div>
                <div>
                  <p className="text-[#9AA0A6] text-sm">Return Date</p>
                  <p className="text-white">{formatDateTime(booking.return_date)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Details
              </h3>
              <div className="space-y-3">
                <div className="bg-[#0B0C0F] p-3 rounded-lg border border-[#D4AF37]/20">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[#9AA0A6] text-xs mb-1">Pickup Location</p>
                      <p className="text-white font-semibold text-sm">{booking.pickup_location}</p>
                      {booking.pickup_location_address && (
                        <p className="text-[#D4AF37] text-xs mt-1 italic">{booking.pickup_location_address}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-[#9AA0A6]" />
                        <span className="text-[#9AA0A6] text-xs">{getTimeFromDate(booking.pickup_date)}</span>
                        {isAfterHours(booking.pickup_date) && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            After Hours
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0B0C0F] p-3 rounded-lg border border-[#D4AF37]/20">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[#9AA0A6] text-xs mb-1">Return Location</p>
                      <p className="text-white font-semibold text-sm">{booking.return_location}</p>
                      {booking.return_location_address && (
                        <p className="text-[#D4AF37] text-xs mt-1 italic">{booking.return_location_address}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-[#9AA0A6]" />
                        <span className="text-[#9AA0A6] text-xs">{getTimeFromDate(booking.return_date)}</span>
                        {isAfterHours(booking.return_date) && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            After Hours
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cost Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[#9AA0A6] text-sm">Base Rental</p>
                  <p className="text-white font-semibold">€{calculateBaseCost().toFixed(2)}</p>
                </div>
                {booking.custom_location_fee && booking.custom_location_fee > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-[#9AA0A6] text-sm">Custom Location Fee</p>
                    <p className="text-white font-semibold">€{booking.custom_location_fee.toFixed(2)}</p>
                  </div>
                )}
                {booking.after_hours_fee && booking.after_hours_fee > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-[#9AA0A6] text-sm">After Hours Fee</p>
                    <p className="text-white font-semibold">€{booking.after_hours_fee.toFixed(2)}</p>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-[#D4AF37]/20">
                  <div className="flex justify-between items-center">
                    <p className="text-white font-bold">Total Price</p>
                    <p className="text-[#D4AF37] font-bold text-xl">€{booking.total_price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#D4AF37]/10">
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-[#9AA0A6]">Payment Method</p>
                    <p className="text-white capitalize">{booking.payment_method === 'stripe' ? 'Credit Card' : booking.payment_method}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <p className="text-[#9AA0A6]">Payment Status</p>
                    <p className={`capitalize font-semibold ${
                      booking.payment_status === 'paid' ? 'text-green-500' :
                      booking.payment_status === 'partial' ? 'text-amber-500' :
                      booking.payment_status === 'failed' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {booking.payment_status === 'partial' ? 'Deposit Paid' : booking.payment_status}
                    </p>
                  </div>
                  {booking.payment_status === 'partial' && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-amber-500 text-xs font-semibold mb-2">Partial Payment (Cash at Pickup)</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#9AA0A6]">Deposit Paid</span>
                        <span className="text-green-500 font-bold">EUR {(booking.deposit_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-[#9AA0A6]">Remaining Due</span>
                        <span className="text-amber-500 font-bold text-lg">EUR {(booking.remaining_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {booking.stripe_payment_intent_id && (
                    <div className="mt-2">
                      <p className="text-[#9AA0A6] text-xs mb-1">Stripe Payment ID</p>
                      <p className="text-white font-mono text-xs break-all">
                        {booking.stripe_payment_intent_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-3">Booking Status</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-[#9AA0A6] text-sm">Current Status</p>
                  <p className="text-white capitalize font-semibold">
                    {booking.booking_status}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AA0A6] text-sm">Booking ID</p>
                  <p className="text-white font-mono text-sm">{booking.id}</p>
                </div>
                <div>
                  <p className="text-[#9AA0A6] text-sm">Created At</p>
                  <p className="text-white">{formatDateTime(booking.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#D4AF37]/20 pt-6">
            <FuelLevelManager
              bookingId={booking.id}
              bookingStatus={booking.booking_status}
              pickupFuelLevel={booking.pickup_fuel_level}
              returnFuelLevel={booking.return_fuel_level}
              fuelCharge={booking.fuel_charge_amount}
              onUpdate={onUpdate}
            />
          </div>

          {booking.booking_status === 'pending' && booking.payment_status === 'paid' && (
            <div className="flex gap-4 pt-4 border-t border-[#D4AF37]/20">
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XIcon className="w-5 h-5" />
                Reject Booking
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 btn-primary px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                Approve Booking
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-red-500/20">
            <div className="bg-red-500/5 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-500 font-semibold mb-1">Zonă Periculoasă</h4>
                  <p className="text-[#9AA0A6] text-sm">
                    Ștergerea unei rezervări este o acțiune permanentă care nu poate fi anulată.
                    Rezervarea va fi eliminată complet din baza de date.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-red-500/10 border-2 border-red-500/40 text-red-500 hover:bg-red-500/20 hover:border-red-500 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              Șterge Permanent Rezervarea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
