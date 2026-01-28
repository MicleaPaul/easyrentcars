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
  try {
    const pickupISO = `${pickupDate}T00:00:00Z`;
    const returnISO = `${returnDate}T23:59:59Z`;

    console.log('Checking availability for vehicle:', vehicleId, 'from', pickupISO, 'to', returnISO);

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, pickup_date, return_date, booking_status')
      .eq('vehicle_id', vehicleId)
      .lt('pickup_date', returnISO)
      .gt('return_date', pickupISO)
      .in('booking_status', ['confirmed', 'active', 'pending_verification', 'pending_payment']);

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError);
      throw new Error(`Failed to check bookings: ${bookingsError.message}`);
    }

    console.log('Bookings found:', bookings?.length || 0);

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
      throw new Error(`Failed to check vehicle blocks: ${blocksError.message}`);
    }

    console.log('Vehicle blocks found:', blocks?.length || 0);

    if (blocks && blocks.length > 0) {
      console.log('Vehicle is blocked:', blocks[0]);
      return {
        isAvailable: false,
        reason: blocks[0].reason || 'Vehicle is blocked for this period',
        conflictType: 'block'
      };
    }

    console.log('Vehicle is available');
    return {
      isAvailable: true
    };
  } catch (error) {
    console.error('Availability check failed:', error);
    throw error;
  }
}
