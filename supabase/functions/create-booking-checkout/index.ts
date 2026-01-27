import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const ALLOWED_ORIGINS = [
  'https://easyrentcars.rentals',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_ORIGINS.some(origin => {
      const allowedUrl = new URL(origin);
      return parsedUrl.origin === allowedUrl.origin;
    });
  } catch {
    return false;
  }
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
});

async function cleanupExpiredHolds() {
  await supabase.rpc('cleanup_expired_holds');
}

interface BookingData {
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
  contract_number: string | null;
  notes: string | null;
  language: string;
  guest_link_token: string;
  payment_method: 'stripe' | 'cash';
  rental_days: number;
  rental_cost: number;
  cleaning_fee: number;
  location_fees: number;
  after_hours_fee: number;
  total_amount: number;
  success_url: string;
  cancel_url: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bookingData: BookingData = await req.json();

    // Validate redirect URLs to prevent open redirect vulnerability
    if (!isValidRedirectUrl(bookingData.success_url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid success_url' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!isValidRedirectUrl(bookingData.cancel_url)) {
      return new Response(
        JSON.stringify({ error: 'Invalid cancel_url' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, brand, model, price_per_day, minimum_age')
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

    await cleanupExpiredHolds();

    const { data: activeHolds } = await supabase
      .from('checkout_holds')
      .select('id')
      .eq('vehicle_id', bookingData.vehicle_id)
      .eq('status', 'active')
      .lte('pickup_date', bookingData.return_date)
      .gte('return_date', bookingData.pickup_date);

    if (activeHolds && activeHolds.length > 0) {
      throw new Error('Vehicle is currently being booked by another customer. Please try again in a few minutes or choose different dates.');
    }

    const { data: pricingSettings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['cleaning_fee']);

    const dbCleaningFee = pricingSettings?.find(s => s.key === 'cleaning_fee')?.value?.amount || 7;

    const serverCleaningFee = dbCleaningFee;

    const serverTotal = (bookingData.rental_days * vehicle.price_per_day) +
      serverCleaningFee +
      bookingData.location_fees +
      bookingData.after_hours_fee;

    if (Math.abs(bookingData.total_amount - serverTotal) > 1) {
      console.warn(`Total mismatch: client ${bookingData.total_amount}, server ${serverTotal}`);
    }

    const isCashPayment = bookingData.payment_method === 'cash';
    const depositAmount = isCashPayment ? vehicle.price_per_day : serverTotal;
    const remainingAmount = serverTotal - depositAmount;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (isCashPayment) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Deposit - ${vehicle.brand} ${vehicle.model}`,
            description: `1 day rental deposit (remaining EUR${remainingAmount.toFixed(2)} due at pickup)`,
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
            name: `${vehicle.brand} ${vehicle.model}`,
            description: `${bookingData.rental_days} ${bookingData.rental_days === 1 ? 'Tag' : 'Tage'} Miete`,
          },
          unit_amount: Math.round(vehicle.price_per_day * 100),
        },
        quantity: bookingData.rental_days,
      });

      if (serverCleaningFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Cleaning Fee',
              description: 'One-time cleaning fee',
            },
            unit_amount: Math.round(serverCleaningFee * 100),
          },
          quantity: 1,
        });
      }

      if (bookingData.location_fees > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Location Fees',
              description: 'Pickup and Return Fees',
            },
            unit_amount: Math.round(bookingData.location_fees * 100),
          },
          quantity: 1,
        });
      }

      if (bookingData.after_hours_fee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'After Hours Service',
              description: 'Service outside regular business hours',
            },
            unit_amount: Math.round(bookingData.after_hours_fee * 100),
          },
          quantity: 1,
        });
      }
    }

    const bookingMetadata = {
      vehicle_id: bookingData.vehicle_id,
      vehicle_brand: vehicle.brand,
      vehicle_model: vehicle.model,
      customer_name: bookingData.customer_name,
      customer_email: bookingData.customer_email,
      customer_phone: bookingData.customer_phone,
      customer_age: String(bookingData.customer_age),
      pickup_date: bookingData.pickup_date,
      return_date: bookingData.return_date,
      pickup_time: bookingData.pickup_time,
      return_time: bookingData.return_time,
      pickup_location: bookingData.pickup_location,
      return_location: bookingData.return_location,
      pickup_location_address: bookingData.pickup_location_address || '',
      return_location_address: bookingData.return_location_address || '',
      pickup_fee: String(bookingData.pickup_fee),
      return_fee: String(bookingData.return_fee),
      contract_number: bookingData.contract_number || '',
      notes: (bookingData.notes || '').substring(0, 400),
      language: bookingData.language,
      guest_link_token: bookingData.guest_link_token,
      payment_method: bookingData.payment_method,
      payment_type: isCashPayment ? 'deposit' : 'full',
      rental_days: String(bookingData.rental_days),
      rental_cost: String(bookingData.rental_days * vehicle.price_per_day),
      cleaning_fee: String(serverCleaningFee),
      location_fees: String(bookingData.location_fees),
      after_hours_fee: String(bookingData.after_hours_fee),
      total_amount: String(serverTotal),
      deposit_amount: String(depositAmount),
      remaining_amount: String(remainingAmount),
    };

    const sessionExpiresAt = Math.floor(Date.now() / 1000) + (30 * 60);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${bookingData.success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: bookingData.cancel_url,
      customer_email: bookingData.customer_email,
      metadata: bookingMetadata,
      expires_at: sessionExpiresAt,
    });

    const holdExpiresAt = new Date((sessionExpiresAt + 300) * 1000).toISOString();

    const { error: holdError } = await supabase
      .from('checkout_holds')
      .insert({
        vehicle_id: bookingData.vehicle_id,
        stripe_session_id: session.id,
        pickup_date: bookingData.pickup_date,
        return_date: bookingData.return_date,
        customer_email: bookingData.customer_email,
        expires_at: holdExpiresAt,
        status: 'active',
      });

    if (holdError) {
      console.warn('Failed to create checkout hold:', holdError);
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        payment_type: isCashPayment ? 'deposit' : 'full',
        amount_to_pay: depositAmount,
        remaining_due: remainingAmount,
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
    const safeMessage = error.message?.includes('Vehicle') || error.message?.includes('available')
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