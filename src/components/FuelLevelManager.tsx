import { useState } from 'react';
import { Fuel, AlertTriangle, Check, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FuelLevelManagerProps {
  bookingId: string;
  bookingStatus: string;
  pickupFuelLevel?: number;
  returnFuelLevel?: number;
  fuelCharge: number;
  onUpdate: () => void;
}

export function FuelLevelManager({
  bookingId,
  bookingStatus,
  pickupFuelLevel,
  returnFuelLevel,
  fuelCharge,
  onUpdate,
}: FuelLevelManagerProps) {
  const [editingPickup, setEditingPickup] = useState(false);
  const [editingReturn, setEditingReturn] = useState(false);
  const [pickupValue, setPickupValue] = useState(pickupFuelLevel?.toString() || '100');
  const [returnValue, setReturnValue] = useState(returnFuelLevel?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canEditPickup = ['Confirmed', 'Active', 'Completed', 'PendingVerification', 'PendingPayment'].includes(bookingStatus);
  const canEditReturn = ['Active', 'Completed'].includes(bookingStatus) && pickupFuelLevel !== undefined;

  const fuelDifference = pickupFuelLevel && returnFuelLevel
    ? pickupFuelLevel - returnFuelLevel
    : 0;

  const handleSavePickup = async () => {
    const level = parseFloat(pickupValue);
    if (isNaN(level) || level < 0 || level > 100) {
      setError('Fuel level must be between 0 and 100');
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

      setEditingPickup(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Error saving fuel level');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReturn = async () => {
    const level = parseFloat(returnValue);
    if (isNaN(level) || level < 0 || level > 100) {
      setError('Fuel level must be between 0 and 100');
      return;
    }

    if (!pickupFuelLevel) {
      setError('Pickup fuel level is not set');
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

      setEditingReturn(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Error saving fuel level');
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

  return (
    <div className="space-y-4">
      <h3 className="text-[#D4AF37] font-semibold flex items-center gap-2">
        <Fuel className="w-5 h-5" />
        Nivel Combustibil
      </h3>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-[#0B0C0F] border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#9AA0A6] text-sm">La Predare (Pickup)</p>
            {pickupFuelLevel !== undefined && !editingPickup && (
              <span className="text-white font-semibold">{pickupFuelLevel}%</span>
            )}
          </div>

          {editingPickup ? (
            <div className="space-y-3">
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={pickupValue}
                  onChange={(e) => setPickupValue(e.target.value)}
                  className="w-full bg-[#111316] text-white px-4 py-2 rounded-lg border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none"
                  placeholder="0-100"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={pickupValue}
                  onChange={(e) => setPickupValue(e.target.value)}
                  className="w-full mt-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSavePickup}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {pickupFuelLevel !== undefined ? 'Update Level' : 'Save and Handover Car'}
                </button>
                <button
                  onClick={() => {
                    setEditingPickup(false);
                    setPickupValue(pickupFuelLevel?.toString() || '100');
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-[#D4AF37]/20 text-[#9AA0A6] rounded-lg hover:border-[#D4AF37] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : pickupFuelLevel !== undefined ? (
            <div className="space-y-2">
              <div className="h-3 bg-[#111316] rounded-full overflow-hidden">
                <div
                  className={`h-full ${getFuelBarColor(pickupFuelLevel)} transition-all`}
                  style={{ width: `${pickupFuelLevel}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <Check className="w-4 h-4" />
                  Recorded Level
                </div>
                {canEditPickup && (
                  <button
                    onClick={() => {
                      setPickupValue(pickupFuelLevel.toString());
                      setEditingPickup(true);
                    }}
                    className="px-3 py-1 text-xs border border-[#D4AF37]/40 text-[#D4AF37] rounded hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ) : canEditPickup ? (
            <button
              onClick={() => setEditingPickup(true)}
              className="w-full px-4 py-2 border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 transition-colors font-semibold"
            >
              Set Fuel Level at Pickup
            </button>
          ) : (
            <p className="text-[#9AA0A6] text-sm">Not available yet</p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-[#0B0C0F] border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#9AA0A6] text-sm">La Returnare (Return)</p>
            {returnFuelLevel !== undefined && !editingReturn && (
              <span className="text-white font-semibold">{returnFuelLevel}%</span>
            )}
          </div>

          {editingReturn ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-3">
                <p className="text-[#D4AF37] text-sm">
                  Nivel la predare: <span className="font-semibold">{pickupFuelLevel}%</span>
                </p>
                <p className="text-[#9AA0A6] text-xs mt-1">
                  Car must be returned with at least this level
                </p>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={returnValue}
                  onChange={(e) => setReturnValue(e.target.value)}
                  className="w-full bg-[#111316] text-white px-4 py-2 rounded-lg border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none"
                  placeholder="0-100"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={returnValue}
                  onChange={(e) => setReturnValue(e.target.value)}
                  className="w-full mt-2"
                />
                {returnValue && parseFloat(returnValue) < (pickupFuelLevel || 0) && (
                  <p className="text-orange-500 text-xs mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Warning: Level lower than at pickup. A fee will be applied.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveReturn}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {returnFuelLevel !== undefined ? 'Update Level' : 'Complete Rental'}
                </button>
                <button
                  onClick={() => {
                    setEditingReturn(false);
                    setReturnValue(returnFuelLevel?.toString() || '');
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-[#D4AF37]/20 text-[#9AA0A6] rounded-lg hover:border-[#D4AF37] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : returnFuelLevel !== undefined ? (
            <div className="space-y-2">
              <div className="h-3 bg-[#111316] rounded-full overflow-hidden">
                <div
                  className={`h-full ${getFuelBarColor(returnFuelLevel)} transition-all`}
                  style={{ width: `${returnFuelLevel}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {fuelDifference > 0 ? (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-500 font-semibold text-sm">
                            Combustibil Insuficient
                          </p>
                          <p className="text-red-400 text-xs mt-1">
                            Difference: {fuelDifference.toFixed(1)}% | Fee: €{fuelCharge.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <Check className="w-4 h-4" />
                      Satisfactory Level
                    </div>
                  )}
                </div>
                {canEditReturn && (
                  <button
                    onClick={() => {
                      setReturnValue(returnFuelLevel.toString());
                      setEditingReturn(true);
                    }}
                    className="px-3 py-1 text-xs border border-[#D4AF37]/40 text-[#D4AF37] rounded hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ) : canEditReturn ? (
            <button
              onClick={() => setEditingReturn(true)}
              className="w-full px-4 py-2 border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 transition-colors font-semibold"
            >
              Set Fuel Level at Return
            </button>
          ) : (
            <p className="text-[#9AA0A6] text-sm">
              {!pickupFuelLevel
                ? 'Pickup fuel level must be set first'
                : 'Not available yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
