import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
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
    const {
      booking_id,
      customer_email,
      customer_name,
      vehicle_brand,
      vehicle_model,
      rental_days,
      price_per_day,
      cleaning_fee,
      location_fees,
      unlimited_km_fee,
      after_hours_fee,
      total_amount,
      payment_method,
      success_url,
      cancel_url,
    } = await req.json();

    const { data: existingBookings, error: conflictError } = await supabase
      .from('bookings')
      .select('id, pickup_date, return_date')
      .eq('id', booking_id)
      .single();

    if (conflictError) {
      console.error('Error fetching booking:', conflictError);
      throw new Error('Booking not found');
    }

    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .neq('id', booking_id)
      .eq('vehicle_id', existingBookings.vehicle_id)
      .in('booking_status', ['Confirmed', 'Active', 'confirmed', 'active'])
      .or(`pickup_date.lt.${existingBookings.return_date},return_date.gt.${existingBookings.pickup_date}`);

    if (conflictingBookings && conflictingBookings.length > 0) {
      throw new Error('Vehicle is no longer available for the selected dates');
    }

    const { data: pricingSettings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['cleaning_fee', 'unlimited_km_fee']);

    const dbCleaningFee = pricingSettings?.find(s => s.key === 'cleaning_fee')?.value?.amount || 7;
    const dbUnlimitedKmFeePerDay = pricingSettings?.find(s => s.key === 'unlimited_km_fee')?.value?.amount_per_day || 15;

    const serverCleaningFee = dbCleaningFee;
    const serverUnlimitedKmFee = unlimited_km_fee > 0 ? dbUnlimitedKmFeePerDay * rental_days : 0;

    if (Math.abs(cleaning_fee - serverCleaningFee) > 0.01) {
      console.warn(`Warning: Cleaning fee mismatch: Frontend sent ${cleaning_fee}, using server value ${serverCleaningFee}`);
    }

    if (Math.abs(unlimited_km_fee - serverUnlimitedKmFee) > 0.01) {
      console.warn(`Warning: Unlimited KM fee mismatch: Frontend sent ${unlimited_km_fee}, using server value ${serverUnlimitedKmFee}`);
    }

    const actualCleaningFee = serverCleaningFee;
    const actualUnlimitedKmFee = serverUnlimitedKmFee;
    const serverTotal = (rental_days * price_per_day) + actualCleaningFee + location_fees + after_hours_fee + actualUnlimitedKmFee;

    if (Math.abs(total_amount - serverTotal) > 0.01) {
      console.warn(`Warning: Total amount mismatch: Frontend sent ${total_amount}, server calculated ${serverTotal}`);
    }

    const isCashPayment = payment_method === 'cash';
    const depositAmount = isCashPayment ? price_per_day : serverTotal;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (isCashPayment) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Deposit - ${vehicle_brand} ${vehicle_model}`,
            description: `1 day rental deposit (remaining EUR${(serverTotal - depositAmount).toFixed(2)} due at pickup)`,
          },
          unit_amount: Math.round(depositAmount * 100),
        },
        quantity: 1,
      });
    } else {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${vehicle_brand} ${vehicle_model}`,
            description: `${rental_days} ${rental_days === 1 ? 'Tag' : 'Tage'} Miete`,
          },
          unit_amount: Math.round(price_per_day * 100),
        },
        quantity: rental_days,
      });

      if (actualCleaningFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Cleaning Fee',
              description: 'One-time cleaning fee',
            },
            unit_amount: Math.round(actualCleaningFee * 100),
          },
          quantity: 1,
        });
      }

      if (location_fees > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Location Fees',
              description: 'Pickup and Return Fees',
            },
            unit_amount: Math.round(location_fees * 100),
          },
          quantity: 1,
        });
      }

      if (actualUnlimitedKmFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Unlimited Kilometers',
              description: `${rental_days} ${rental_days === 1 ? 'Day' : 'Days'} Unlimited KM`,
            },
            unit_amount: Math.round((actualUnlimitedKmFee / rental_days) * 100),
          },
          quantity: rental_days,
        });
      }

      if (after_hours_fee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'After Hours Service',
              description: 'Service outside regular business hours',
            },
            unit_amount: Math.round(after_hours_fee * 100),
          },
          quantity: 1,
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${Deno.env.get('SITE_URL')}/booking-success?booking_id=${booking_id}`,
      cancel_url: cancel_url || `${Deno.env.get('SITE_URL')}/booking/${booking_id}`,
      customer_email: customer_email,
      client_reference_id: booking_id,
      metadata: {
        booking_id: booking_id,
        customer_name: customer_name,
        payment_type: isCashPayment ? 'deposit' : 'full',
        total_amount: serverTotal.toString(),
        deposit_amount: depositAmount.toString(),
        remaining_amount: (serverTotal - depositAmount).toString(),
      },
    });

    await supabase
      .from('bookings')
      .update({
        stripe_session_id: session.id,
        stripe_checkout_url: session.url,
        deposit_amount: isCashPayment ? depositAmount : null,
        remaining_amount: isCashPayment ? (serverTotal - depositAmount) : null,
      })
      .eq('id', booking_id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        payment_type: isCashPayment ? 'deposit' : 'full',
        amount_to_pay: depositAmount,
        remaining_due: serverTotal - depositAmount,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    const safeMessage = error.message?.includes('Vehicle')
      ? error.message
      : 'An error occurred while processing your request';
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