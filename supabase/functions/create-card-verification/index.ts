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

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
});

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { booking_id, customer_email } = await req.json();

    if (!booking_id) {
      throw new Error('Missing booking_id');
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Verify authorization - must provide matching customer_email or be authenticated admin
    const authHeader = req.headers.get('Authorization');
    let isAuthorized = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (!authError && user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single();

        isAuthorized = !!adminUser || user.email === booking.customer_email;
      }
    }

    // Also allow if customer_email matches booking
    if (!isAuthorized && customer_email) {
      isAuthorized = customer_email === booking.customer_email;
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Email does not match booking' }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (booking.booking_status !== 'PendingPayment') {
      throw new Error(`Invalid booking status: ${booking.booking_status}. Expected PendingPayment.`);
    }

    let customerId = null;

    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('email', booking.customer_email)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: booking.customer_email,
        name: booking.customer_name,
        metadata: {
          booking_id: booking_id,
        },
      });

      customerId = customer.id;

      await supabase.from('stripe_customers').insert({
        customer_id: customerId,
        email: booking.customer_email,
        name: booking.customer_name,
      });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        booking_id: booking_id,
        customer_email: booking.customer_email,
        customer_name: booking.customer_name,
      },
    });

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        stripe_setup_intent_id: setupIntent.id,
      })
      .eq('id', booking_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        client_secret: setupIntent.client_secret,
        setup_intent_id: setupIntent.id,
        customer_id: customerId,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating card verification:', error);
    const safeMessage = error.message === 'Booking not found' || error.message === 'Missing booking_id'
      ? error.message
      : 'An error occurred while setting up card verification';
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