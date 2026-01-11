import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const ALLOWED_ORIGINS = [
  'https://easyrentcars.rentals',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface TestBookingData {
  vehicle_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_age: number;
  pickup_date: string;
  return_date: string;
  pickup_time: string;
  return_time: string;
  pickup_location: string;
  return_location: string;
  pickup_location_address: string | null;
  return_location_address: string | null;
  pickup_fee: number;
  return_fee: number;
  unlimited_kilometers: boolean;
  contract_number: string | null;
  notes: string | null;
  language: string;
  guest_link_token: string;
  payment_method: 'stripe' | 'cash';
  rental_days: number;
  rental_cost: number;
  cleaning_fee: number;
  location_fees: number;
  unlimited_km_fee: number;
  after_hours_fee: number;
  total_amount: number;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { data: testModeSetting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'test_mode')
      .maybeSingle();

    if (!testModeSetting?.value?.enabled) {
      return new Response(
        JSON.stringify({ error: 'Test mode is not enabled' }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const bookingData: TestBookingData = await req.json();

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, brand, model, price_per_day')
      .eq('id', bookingData.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      throw new Error('Vehicle not found');
    }

    const pickupISO = `${bookingData.pickup_date}T00:00:00Z`;
    const returnISO = `${bookingData.return_date}T23:59:59Z`;

    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', bookingData.vehicle_id)
      .in('booking_status', ['Confirmed', 'Active', 'confirmed', 'active'])
      .lt('pickup_date', returnISO)
      .gt('return_date', pickupISO);

    if (conflictingBookings && conflictingBookings.length > 0) {
      throw new Error('Vehicle is no longer available for the selected dates');
    }

    const { data: blocks } = await supabase
      .from('vehicle_blocks')
      .select('id')
      .eq('vehicle_id', bookingData.vehicle_id)
      .lt('blocked_from', returnISO)
      .gt('blocked_until', pickupISO);

    if (blocks && blocks.length > 0) {
      throw new Error('Vehicle is blocked for the selected dates');
    }

    const { data: pricingSettings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['cleaning_fee', 'unlimited_km_fee']);

    const dbCleaningFee = pricingSettings?.find(s => s.key === 'cleaning_fee')?.value?.amount || 7;
    const dbUnlimitedKmFeePerDay = pricingSettings?.find(s => s.key === 'unlimited_km_fee')?.value?.amount_per_day || 15;

    const serverCleaningFee = dbCleaningFee;
    const serverUnlimitedKmFee = bookingData.unlimited_kilometers ? dbUnlimitedKmFeePerDay * bookingData.rental_days : 0;

    const serverTotal = (bookingData.rental_days * vehicle.price_per_day) +
      serverCleaningFee +
      bookingData.location_fees +
      bookingData.after_hours_fee +
      serverUnlimitedKmFee;

    const pickupDateTime = `${bookingData.pickup_date}T${bookingData.pickup_time}:00Z`;
    const returnDateTime = `${bookingData.return_date}T${bookingData.return_time}:00Z`;

    const testNotes = `[TEST MODE] No payment processed - Created for testing purposes\n\n${bookingData.notes || ''}`;

    const isCashPayment = bookingData.payment_method === 'cash';
    const depositAmount = isCashPayment ? vehicle.price_per_day : 0;
    const remainingAmount = isCashPayment ? serverTotal - depositAmount : 0;

    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        vehicle_id: bookingData.vehicle_id,
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        customer_age: bookingData.customer_age,
        pickup_date: pickupDateTime,
        return_date: returnDateTime,
        pickup_location: bookingData.pickup_location,
        return_location: bookingData.return_location,
        pickup_location_address: bookingData.pickup_location_address || null,
        return_location_address: bookingData.return_location_address || null,
        pickup_fee: bookingData.pickup_fee,
        return_fee: bookingData.return_fee,
        unlimited_kilometers: bookingData.unlimited_kilometers,
        contract_number: bookingData.contract_number || null,
        total_price: serverTotal,
        rental_cost: bookingData.rental_days * vehicle.price_per_day,
        rental_days: bookingData.rental_days,
        unlimited_km_fee: serverUnlimitedKmFee,
        cleaning_fee: serverCleaningFee,
        after_hours_fee: bookingData.after_hours_fee,
        payment_method: bookingData.payment_method,
        payment_status: 'completed',
        booking_status: 'Confirmed',
        deposit_amount: isCashPayment ? depositAmount : null,
        remaining_amount: isCashPayment ? remainingAmount : null,
        is_test_mode: true,
        notes: testNotes,
        language: bookingData.language,
        guest_link_token: bookingData.guest_link_token,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating test booking:', insertError);
      throw new Error('Failed to create booking');
    }

    console.log(`
      ============================================
      TEST BOOKING CREATED
      ============================================
      Booking ID: ${newBooking.id}
      Customer: ${bookingData.customer_name}
      Vehicle: ${vehicle.brand} ${vehicle.model}
      Total: EUR${serverTotal}
      ============================================
    `);

    try {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-confirmation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking_id: newBooking.id }),
        }
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: newBooking.id,
        message: 'Test booking created successfully',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating test booking:', error);
    const safeMessage = error.message?.includes('Vehicle') || error.message?.includes('available')
      ? error.message
      : 'An error occurred while creating the test booking';
    return new Response(
      JSON.stringify({ error: safeMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});