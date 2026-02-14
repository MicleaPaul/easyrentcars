import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const ALLOWED_ORIGINS = [
  'https://easyrentcars.rentals',
  'https://www.easyrentcars.rentals',
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

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  appInfo: { name: 'EasyRentCars Integration', version: '1.0.0' },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id, booking_status, payment_status')
      .eq('stripe_session_id', session_id)
      .maybeSingle();

    if (existingBooking) {
      return new Response(
        JSON.stringify({ status: 'found', booking_id: existingBooking.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ status: 'unpaid', payment_status: session.payment_status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const metadata = session.metadata;
    if (!metadata || !metadata.vehicle_id) {
      return new Response(
        JSON.stringify({ status: 'error', error: 'No booking metadata in session' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentType = metadata.payment_type || 'full';
    const depositAmount = parseFloat(metadata.deposit_amount || '0');
    const remainingAmount = parseFloat(metadata.remaining_amount || '0');
    const totalAmount = parseFloat(metadata.total_amount || '0');

    const pickupDateTime = `${metadata.pickup_date}T${metadata.pickup_time}:00Z`;
    const returnDateTime = `${metadata.return_date}T${metadata.return_time}:00Z`;

    const bookingData = {
      vehicle_id: metadata.vehicle_id,
      customer_name: metadata.customer_name,
      customer_email: metadata.customer_email,
      customer_phone: metadata.customer_phone,
      customer_age: parseInt(metadata.customer_age),
      pickup_date: pickupDateTime,
      return_date: returnDateTime,
      pickup_location: metadata.pickup_location,
      return_location: metadata.return_location,
      pickup_location_address: metadata.pickup_location_address || null,
      return_location_address: metadata.return_location_address || null,
      pickup_fee: parseFloat(metadata.pickup_fee || '0'),
      return_fee: parseFloat(metadata.return_fee || '0'),
      contract_number: metadata.contract_number || null,
      total_price: totalAmount,
      rental_cost: parseFloat(metadata.rental_cost || '0'),
      rental_days: parseInt(metadata.rental_days || '1'),
      cleaning_fee: parseFloat(metadata.cleaning_fee || '0'),
      after_hours_fee: parseFloat(metadata.after_hours_fee || '0'),
      payment_method: metadata.payment_method,
      payment_status: 'paid',
      booking_status: 'Confirmed',
      deposit_amount: paymentType === 'deposit' ? depositAmount : null,
      remaining_amount: paymentType === 'deposit' ? remainingAmount : null,
      deposit_paid_at: paymentType === 'deposit' ? new Date().toISOString() : null,
      notes: metadata.notes || null,
      language: metadata.language || 'de',
      guest_link_token: metadata.guest_link_token,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
    };

    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: retryBooking } = await supabase
          .from('bookings')
          .select('id')
          .eq('stripe_session_id', session_id)
          .maybeSingle();

        if (retryBooking) {
          return new Response(
            JSON.stringify({ status: 'found', booking_id: retryBooking.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.error('Fallback booking creation failed:', JSON.stringify(insertError));
      return new Response(
        JSON.stringify({ status: 'error', error: 'Failed to create booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('checkout_holds')
      .update({ status: 'converted' })
      .eq('stripe_session_id', session.id);

    console.log(`Fallback booking created: ${newBooking.id} for session ${session_id}`);

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
      console.error('Error sending confirmation email from fallback:', emailError);
    }

    return new Response(
      JSON.stringify({ status: 'created', booking_id: newBooking.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error verifying stripe payment:', error);
    return new Response(
      JSON.stringify({ status: 'error', error: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
