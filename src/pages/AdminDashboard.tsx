import { useState, useEffect } from 'react';
import { Car, Calendar, Users, Settings, Plus, Edit2, Trash2, LogOut, MessageCircleQuestion, FileText, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VehicleEditModal } from '../components/VehicleEditModal';
import { VehicleBlockModal } from '../components/VehicleBlockModal';
import { VehicleBlocksManagement } from '../components/VehicleBlocksManagement';
import { BookingsManagement } from '../components/BookingsManagement';
import { FAQManagement } from '../components/FAQManagement';
import { AGBManagement } from '../components/AGBManagement';
import { PrivacyPolicyManagement } from '../components/PrivacyPolicyManagement';
import { SiteSettingsManagement } from '../components/SiteSettingsManagement';
import { Logo } from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  status: string;
  category: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  doors: number;
  minimum_age: number;
  images?: string[];
}

interface VehicleBlock {
  id: string;
  vehicle_id: string;
  blocked_from: string;
  blocked_until: string;
  reason: string;
}

interface DashboardStats {
  totalVehicles: number;
  activeBookings: number;
  totalCustomers: number;
  maintenanceVehicles: number;
}

interface RecentBooking {
  id: string;
  created_at: string;
  customer_name: string;
  booking_status: string;
  pickup_date: string;
  return_date: string;
  vehicle: {
    brand: string;
    model: string;
  };
}

export function AdminDashboard() {
  const { t, language, setLanguage } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleBlocks, setVehicleBlocks] = useState<Record<string, VehicleBlock[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'bookings' | 'blocks' | 'faqs' | 'agb' | 'privacy' | 'settings'>('overview');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [blockingVehicle, setBlockingVehicle] = useState<{ id: string; name: string; block?: VehicleBlock } | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeBookings: 0,
    totalCustomers: 0,
    maintenanceVehicles: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
    fetchVehicleBlocks();
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  async function fetchVehicles() {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVehicleBlocks() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('vehicle_blocks')
        .select('*')
        .gte('blocked_until', now)
        .order('blocked_from', { ascending: true });

      if (error) throw error;

      const blocksByVehicle: Record<string, VehicleBlock[]> = {};
      data?.forEach(block => {
        if (!blocksByVehicle[block.vehicle_id]) {
          blocksByVehicle[block.vehicle_id] = [];
        }
        blocksByVehicle[block.vehicle_id].push(block);
      });

      setVehicleBlocks(blocksByVehicle);
    } catch (error) {
      console.error('Error fetching vehicle blocks:', error);
    }
  }

  async function fetchDashboardStats() {
    try {
      setStatsLoading(true);

      const [bookingsResult, vehiclesResult] = await Promise.all([
        supabase.from('bookings').select('booking_status, customer_email'),
        supabase.from('vehicles').select('status')
      ]);

      if (bookingsResult.error) throw bookingsResult.error;
      if (vehiclesResult.error) throw vehiclesResult.error;

      const bookingsData = bookingsResult.data || [];
      const vehiclesData = vehiclesResult.data || [];

      const activeBookings = bookingsData.filter(
        b => b.booking_status === 'Confirmed' || b.booking_status === 'Active' || b.booking_status === 'PendingVerification' || b.booking_status === 'PendingPayment'
      ).length;

      const uniqueCustomers = new Set(bookingsData.map(b => b.customer_email)).size;

      setDashboardStats({
        totalVehicles: vehiclesData.length,
        activeBookings,
        totalCustomers: uniqueCustomers,
        maintenanceVehicles: vehiclesData.filter(v => v.status === 'maintenance').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchRecentActivity() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          created_at,
          customer_name,
          booking_status,
          pickup_date,
          return_date,
          vehicle_id,
          vehicles:vehicle_id (
            brand,
            model
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedBookings: RecentBooking[] = (data || []).map((booking: any) => ({
        id: booking.id,
        created_at: booking.created_at,
        customer_name: booking.customer_name,
        booking_status: booking.booking_status,
        pickup_date: booking.pickup_date,
        return_date: booking.return_date,
        vehicle: {
          brand: booking.vehicles?.brand || '',
          model: booking.vehicles?.model || '',
        },
      }));

      setRecentBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return t('admin.justNow') || 'chiar acum';
    if (diffInMinutes < 60) return `${diffInMinutes}${t('admin.minutesAgoShort') || 'm'} ${t('admin.ago') || 'în urmă'}`;
    if (diffInHours < 24) return `${diffInHours}${t('admin.hoursAgoShort') || 'h'} ${t('admin.ago') || 'în urmă'}`;
    return `${diffInDays}${t('admin.daysAgoShort') || 'd'} ${t('admin.ago') || 'în urmă'}`;
  };

  const calculateDuration = (pickupDate: string, returnDate: string): string => {
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const diffInMs = returnD.getTime() - pickup.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInDays >= 1) {
      return `${diffInDays} ${diffInDays === 1 ? (t('admin.day') || 'zi') : (t('admin.days') || 'zile')}`;
    }
    return `${diffInHours} ${diffInHours === 1 ? (t('admin.hour') || 'oră') : (t('admin.hours') || 'ore')}`;
  };

  const getActiveBlock = (vehicleId: string): VehicleBlock | null => {
    const blocks = vehicleBlocks[vehicleId];
    if (!blocks || blocks.length === 0) return null;

    const now = new Date();
    const activeBlock = blocks.find(block => {
      const from = new Date(block.blocked_from);
      const until = new Date(block.blocked_until);
      return from <= now && until >= now;
    });

    return activeBlock || blocks[0];
  };

  const formatBlockPeriod = (block: VehicleBlock): string => {
    const from = new Date(block.blocked_from);
    const until = new Date(block.blocked_until);
    const formatDate = (date: Date) => date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
    });
    return `${formatDate(from)} - ${formatDate(until)}`;
  };

  const stats = [
    {
      icon: Car,
      label: t('admin.totalVehicles'),
      value: dashboardStats.totalVehicles,
      color: 'from-[#D4AF37] to-[#F4D03F]',
    },
    {
      icon: Calendar,
      label: t('admin.activeBookings'),
      value: dashboardStats.activeBookings,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      label: t('admin.totalCustomers'),
      value: dashboardStats.totalCustomers,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Settings,
      label: t('admin.maintenance'),
      value: dashboardStats.maintenanceVehicles,
      color: 'from-red-500 to-red-600',
    },
  ];

  const handleLogout = async () => {
    if (confirm(t('admin.logoutConfirm'))) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(t('admin.deleteVehicleConfirm') || `Are you sure you want to delete ${vehicleName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .limit(1);

      if (bookingsError) throw bookingsError;

      if (existingBookings && existingBookings.length > 0) {
        alert(t('admin.cannotDeleteVehicleWithBookings') || 'Cannot delete this vehicle because it has existing bookings. Please change its status to maintenance instead.');
        return;
      }

      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (deleteError) throw deleteError;

      alert(t('admin.vehicleDeletedSuccess') || 'Vehicle deleted successfully!');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert(t('admin.vehicleDeleteError') || 'Failed to delete vehicle. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Logo variant="header" alt="EasyRentCars Logo" />
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-[#111316] text-white px-4 py-2 rounded-lg border border-[#D4AF37]/20 focus:outline-none focus:border-[#D4AF37] font-medium text-sm"
              >
                <option value="de">DE</option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="it">IT</option>
                <option value="es">ES</option>
                <option value="ro">RO</option>
              </select>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-[#D4AF37]/20 text-[#9AA0A6] hover:border-[#D4AF37] hover:text-white transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>
            </div>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {t('admin.title').split(' ')[0]} <span className="text-gradient">{t('admin.dashboard')}</span>
            </h1>
            <p className="text-[#9AA0A6]">{t('admin.subtitle')}</p>
          </div>
        </div>


        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.overview')}
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'vehicles'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.vehicles')}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.bookings')}
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'blocks'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.vehicleBlocks') || 'Blocări'}
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.faqs')}
          </button>
          <button
            onClick={() => setActiveTab('agb')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'agb'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.agb')}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.privacyPolicy')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
            }`}
          >
            {t('admin.settings')}
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="card-luxury p-6 hover:border-[#D4AF37]/40 transition-all">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-[#9AA0A6] text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="card-luxury p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t('admin.recentActivity')}</h2>
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8 text-[#9AA0A6]">
                    {t('admin.noRecentActivity') || 'Nu există activitate recentă'}
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-4 border-b border-[#D4AF37]/10 last:border-0">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold">{t('admin.newBooking')}</p>
                          <p className="text-sm text-[#9AA0A6] truncate">
                            {booking.vehicle.brand} {booking.vehicle.model} - {calculateDuration(booking.pickup_date, booking.return_date)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          booking.booking_status === 'Confirmed'
                            ? 'bg-green-500/10 text-green-500'
                            : booking.booking_status === 'Active'
                            ? 'bg-blue-500/10 text-blue-500'
                            : booking.booking_status === 'Completed'
                            ? 'bg-gray-500/10 text-gray-500'
                            : booking.booking_status === 'Cancelled'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {booking.booking_status}
                        </span>
                      </div>
                      <span className="text-xs text-[#9AA0A6] ml-4 flex-shrink-0">{formatTimeAgo(booking.created_at)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setEditingVehicle({
                  id: '',
                  brand: '',
                  model: '',
                  year: new Date().getFullYear(),
                  price_per_day: 0,
                  status: 'available',
                  category: 'Economy',
                  transmission: 'Automatic',
                  fuel_type: 'Petrol',
                  seats: 5,
                  doors: 4,
                  minimum_age: 25,
                  images: []
                })}
                className="btn-primary px-6 py-3 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('admin.addVehicle')}
              </button>
            </div>

            {loading ? (
              <div className="text-center text-[#9AA0A6] py-12">{t('common.loading')}</div>
            ) : (
              <div className="card-luxury overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0B0C0F]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">{t('admin.vehicle')}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">{t('fleet.filter')}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">{t('fleet.perDay')}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">{t('admin.status')}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4AF37]/10">
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-[#D4AF37]/5 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-semibold">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-[#9AA0A6]">{vehicle.year} • {vehicle.transmission} • {vehicle.fuel_type}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37]">
                              {vehicle.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white font-semibold">€{vehicle.price_per_day}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                vehicle.status === 'available'
                                  ? 'bg-green-500/10 text-green-500'
                                  : vehicle.status === 'rented'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                {vehicle.status}
                              </span>
                              {getActiveBlock(vehicle.id) && (
                                <button
                                  onClick={() => setBlockingVehicle({
                                    id: vehicle.id,
                                    name: `${vehicle.brand} ${vehicle.model}`,
                                    block: getActiveBlock(vehicle.id)!
                                  })}
                                  className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 flex items-center gap-1 hover:bg-orange-500/20 transition-colors cursor-pointer"
                                  title={`${getActiveBlock(vehicle.id)?.reason} - ${formatBlockPeriod(getActiveBlock(vehicle.id)!)} (Click to edit)`}
                                >
                                  <Lock className="w-3 h-3" />
                                  {formatBlockPeriod(getActiveBlock(vehicle.id)!)}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setBlockingVehicle({ id: vehicle.id, name: `${vehicle.brand} ${vehicle.model}` })}
                                className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
                                title={t('admin.blockVehicle') || 'Block vehicle'}
                              >
                                <Lock className="w-4 h-4 text-orange-500" />
                              </button>
                              <button
                                onClick={() => setEditingVehicle(vehicle)}
                                className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && <BookingsManagement />}

        {activeTab === 'blocks' && <VehicleBlocksManagement />}

        {activeTab === 'faqs' && <FAQManagement />}

        {activeTab === 'agb' && <AGBManagement />}

        {activeTab === 'privacy' && <PrivacyPolicyManagement />}

        {activeTab === 'settings' && <SiteSettingsManagement />}
      </div>

      {editingVehicle && (
        <VehicleEditModal
          vehicle={editingVehicle}
          isOpen={!!editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={() => {
            fetchVehicles();
            setEditingVehicle(null);
          }}
        />
      )}

      {blockingVehicle && (
        <VehicleBlockModal
          vehicleId={blockingVehicle.id}
          vehicleName={blockingVehicle.name}
          block={blockingVehicle.block}
          onClose={() => setBlockingVehicle(null)}
          onSave={() => {
            fetchVehicleBlocks();
            setBlockingVehicle(null);
          }}
        />
      )}
    </div>
  );
}
