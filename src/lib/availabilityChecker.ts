import { supabase } from './supabase';

export interface AvailabilityResult {
  isAvailable: boolean;
  reason?: string;
  conflictType?: 'booking' | 'block';
}

export async function checkVehicleAvailability(
  vehicleId: string,
  pickupDate: string,
  returnDate: string
): Promise<AvailabilityResult> {
  if (!vehicleId || !pickupDate || !returnDate) {
    console.error('Invalid parameters for availability check');
    return {
      isAvailable: false,
      reason: 'Invalid booking parameters'
    };
  }

  try {
    const pickupISO = `${pickupDate}T00:00:00Z`;
    const returnISO = `${returnDate}T23:59:59Z`;

    console.log('Checking availability for vehicle:', vehicleId, 'from', pickupISO, 'to', returnISO);

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'check_vehicle_availability_rpc',
      {
        p_vehicle_id: vehicleId,
        p_pickup_date: pickupISO,
        p_return_date: returnISO
      }
    );

    if (rpcError) {
      console.error('RPC availability check error:', rpcError);
      return checkVehicleAvailabilityFallback(vehicleId, pickupISO, returnISO);
    }

    if (rpcResult) {
      console.log('RPC availability result:', rpcResult);
      return {
        isAvailable: rpcResult.isAvailable,
        reason: rpcResult.reason || undefined,
        conflictType: rpcResult.conflictType || undefined
      };
    }

    return {
      isAvailable: true
    };
  } catch (error) {
    console.error('Availability check failed with exception:', error);
    return checkVehicleAvailabilityFallback(vehicleId, `${pickupDate}T00:00:00Z`, `${returnDate}T23:59:59Z`);
  }
}

async function checkVehicleAvailabilityFallback(
  vehicleId: string,
  pickupISO: string,
  returnISO: string
): Promise<AvailabilityResult> {
  console.log('Using fallback availability check method');

  try {
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, pickup_date, return_date, booking_status')
      .eq('vehicle_id', vehicleId)
      .lt('pickup_date', returnISO)
      .gt('return_date', pickupISO)
      .in('booking_status', ['Confirmed', 'Active', 'PendingPayment', 'PendingVerification']);

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError);
      return {
        isAvailable: false,
        reason: `Database error: ${bookingsError.message}`
      };
    }

    if (bookings && bookings.length > 0) {
      return {
        isAvailable: false,
        reason: 'Vehicle is already booked for this period',
        conflictType: 'booking'
      };
    }

    const { data: blocks, error: blocksError } = await supabase
      .from('vehicle_blocks')
      .select('id, blocked_from, blocked_until, reason')
      .eq('vehicle_id', vehicleId)
      .lt('blocked_from', returnISO)
      .gt('blocked_until', pickupISO);

    if (blocksError) {
      console.error('Error checking vehicle blocks:', blocksError);
      return {
        isAvailable: false,
        reason: `Database error: ${blocksError.message}`
      };
    }

    if (blocks && blocks.length > 0) {
      console.log('Vehicle is blocked:', blocks[0]);
      return {
        isAvailable: false,
        reason: blocks[0].reason || 'Vehicle is blocked for this period',
        conflictType: 'block'
      };
    }

    return {
      isAvailable: true
    };
  } catch (error) {
    console.error('Fallback availability check failed:', error);
    return {
      isAvailable: false,
      reason: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
