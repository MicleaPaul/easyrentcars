import { useState } from 'react';
import { X, Fuel, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FuelLevelQuickModalProps {
  bookingId: string;
  bookingStatus: string;
  customerName: string;
  vehicleName: string;
  pickupFuelLevel?: number;
  returnFuelLevel?: number;
  onClose: () => void;
  onUpdate: () => void;
}

export function FuelLevelQuickModal({
  bookingId,
  bookingStatus,
  customerName,
  vehicleName,
  pickupFuelLevel,
  returnFuelLevel,
  onClose,
  onUpdate,
}: FuelLevelQuickModalProps) {
  const [activeMode, setActiveMode] = useState<'pickup' | 'return'>(
    pickupFuelLevel === undefined ? 'pickup' : 'return'
  );
  const [pickupValue, setPickupValue] = useState(pickupFuelLevel?.toString() || '100');
  const [returnValue, setReturnValue] = useState(returnFuelLevel?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canEditPickup = ['Confirmed', 'Active', 'Completed', 'PendingVerification', 'PendingPayment'].includes(bookingStatus);
  const canEditReturn = ['Active', 'Completed'].includes(bookingStatus) && pickupFuelLevel !== undefined;

  const handleSavePickup = async () => {
    const level = parseFloat(pickupValue);
    if (isNaN(level) || level < 0 || level > 100) {
      setError('Nivelul de combustibil trebuie să fie între 0 și 100');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        pickup_fuel_level: level
      };

      if (!pickupFuelLevel && (bookingStatus === 'Confirmed' || bookingStatus === 'PendingVerification' || bookingStatus === 'PendingPayment')) {
        updateData.booking_status = 'Active';
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) throw updateError;

      setSuccess('Nivel combustibil salvat cu succes!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Eroare la salvarea nivelului de combustibil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReturn = async () => {
    const level = parseFloat(returnValue);
    if (isNaN(level) || level < 0 || level > 100) {
      setError('Nivelul de combustibil trebuie să fie între 0 și 100');
      return;
    }

    if (!pickupFuelLevel) {
      setError('Nivelul la predare trebuie setat mai întâi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        return_fuel_level: level
      };

      if (!returnFuelLevel && bookingStatus === 'Active') {
        updateData.booking_status = 'Completed';
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) throw updateError;

      setSuccess('Nivel combustibil salvat cu succes!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Eroare la salvarea nivelului de combustibil');
    } finally {
      setLoading(false);
    }
  };

  const getFuelBarColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const presetLevels = [25, 50, 75, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#111316] border border-[#D4AF37]/20 rounded-xl w-full max-w-lg">
        <div className="bg-[#111316] border-b border-[#D4AF37]/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Fuel className="w-6 h-6 text-[#D4AF37]" />
              Gestionare Combustibil
            </h2>
            <p className="text-[#9AA0A6] text-sm mt-1">{vehicleName} - {customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#9AA0A6]" />
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
              <p className="text-green-500 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                {success}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode('pickup')}
              disabled={!canEditPickup}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeMode === 'pickup'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                  : 'bg-[#0B0C0F] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              La Predare (Pickup)
              {pickupFuelLevel !== undefined && (
                <span className="ml-2 text-sm">✓ {pickupFuelLevel}%</span>
              )}
            </button>
            <button
              onClick={() => setActiveMode('return')}
              disabled={!canEditReturn}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeMode === 'return'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black'
                  : 'bg-[#0B0C0F] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              La Returnare (Return)
              {returnFuelLevel !== undefined && (
                <span className="ml-2 text-sm">✓ {returnFuelLevel}%</span>
              )}
            </button>
          </div>

          {activeMode === 'pickup' && canEditPickup && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <p className="text-[#D4AF37] text-sm font-semibold mb-1">
                  Setează nivelul de combustibil la predarea vehiculului către client
                </p>
                <p className="text-[#9AA0A6] text-xs">
                  Vehiculul ar trebui predat cu rezervorul plin (100%)
                </p>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">
                  Nivel Combustibil: {pickupValue}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={pickupValue}
                  onChange={(e) => setPickupValue(e.target.value)}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  style={{
                    background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${pickupValue}%, #1a1d21 ${pickupValue}%, #1a1d21 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-[#9AA0A6] mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex gap-2">
                {presetLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setPickupValue(level.toString())}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      pickupValue === level.toString()
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-[#0B0C0F] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>

              <div className="h-4 bg-[#0B0C0F] rounded-full overflow-hidden">
                <div
                  className={`h-full ${getFuelBarColor(parseFloat(pickupValue))} transition-all`}
                  style={{ width: `${pickupValue}%` }}
                />
              </div>

              <button
                onClick={handleSavePickup}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Se salvează...' : pickupFuelLevel !== undefined ? 'Actualizează Nivel' : 'Salvează și Predă Mașina'}
              </button>
            </div>
          )}

          {activeMode === 'return' && canEditReturn && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <p className="text-[#D4AF37] text-sm font-semibold mb-1">
                  Nivel la predare: {pickupFuelLevel}%
                </p>
                <p className="text-[#9AA0A6] text-xs">
                  Mașina trebuie returnată cu cel puțin acest nivel
                </p>
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">
                  Nivel Combustibil: {returnValue || '0'}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={returnValue || '0'}
                  onChange={(e) => setReturnValue(e.target.value)}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  style={{
                    background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${returnValue || 0}%, #1a1d21 ${returnValue || 0}%, #1a1d21 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-[#9AA0A6] mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex gap-2">
                {presetLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setReturnValue(level.toString())}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      returnValue === level.toString()
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-[#0B0C0F] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>

              <div className="h-4 bg-[#0B0C0F] rounded-full overflow-hidden">
                <div
                  className={`h-full ${getFuelBarColor(parseFloat(returnValue || '0'))} transition-all`}
                  style={{ width: `${returnValue || 0}%` }}
                />
              </div>

              {returnValue && parseFloat(returnValue) < (pickupFuelLevel || 0) && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-500 font-semibold text-sm">
                        Atenție: Nivel mai mic decât la predare
                      </p>
                      <p className="text-orange-400 text-xs mt-1">
                        Diferență: {((pickupFuelLevel || 0) - parseFloat(returnValue)).toFixed(1)}% - Se va aplica o taxă
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveReturn}
                disabled={loading || !returnValue}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Se salvează...' : returnFuelLevel !== undefined ? 'Actualizează Nivel' : 'Finalizează Închiriere'}
              </button>
            </div>
          )}

          {!canEditPickup && activeMode === 'pickup' && (
            <div className="p-4 rounded-lg bg-[#9AA0A6]/10 border border-[#9AA0A6]/20">
              <p className="text-[#9AA0A6] text-sm">
                Nivelul la predare poate fi setat doar pentru rezervări confirmate sau active
              </p>
            </div>
          )}

          {!canEditReturn && activeMode === 'return' && (
            <div className="p-4 rounded-lg bg-[#9AA0A6]/10 border border-[#9AA0A6]/20">
              <p className="text-[#9AA0A6] text-sm">
                {!pickupFuelLevel
                  ? 'Nivelul la predare trebuie setat mai întâi'
                  : 'Nivelul la returnare poate fi setat doar pentru rezervări active'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
