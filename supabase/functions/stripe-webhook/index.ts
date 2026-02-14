import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'EasyRentCars Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  console.log(`Processing event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`Processing checkout.session.completed: ${session.id}`);

    const metadata = session.metadata;
    if (!metadata || !metadata.vehicle_id) {
      console.error('No booking metadata in session');
      return;
    }

    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingBooking) {
      console.log(`Booking already exists for session ${session.id}`);
      return;
    }

    const pickupDate = metadata.pickup_date;
    const returnDate = metadata.return_date;
    const pickupISO = `${pickupDate}T00:00:00Z`;
    const returnISO = `${returnDate}T23:59:59Z`;

    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', metadata.vehicle_id)
      .in('booking_status', ['Confirmed', 'Active', 'PendingVerification', 'PendingPayment'])
      .lt('pickup_date', returnISO)
      .gt('return_date', pickupISO);

    if (conflictingBookings && conflictingBookings.length > 0) {
      console.error('Vehicle no longer available - initiating refund');

      if (session.payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer',
          });
          console.log('Refund initiated successfully');
        } catch (refundError) {
          console.error('Failed to initiate refund:', refundError);
        }
      }

      return;
    }

    const { data: blocks } = await supabase
      .from('vehicle_blocks')
      .select('id')
      .eq('vehicle_id', metadata.vehicle_id)
      .lt('blocked_from', returnISO)
      .gt('blocked_until', pickupISO);

    if (blocks && blocks.length > 0) {
      console.error('Vehicle is blocked - initiating refund');

      if (session.payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer',
          });
        } catch (refundError) {
          console.error('Failed to initiate refund:', refundError);
        }
      }

      return;
    }

    const pickupDateTime = `${metadata.pickup_date}T${metadata.pickup_time}:00Z`;
    const returnDateTime = `${metadata.return_date}T${metadata.return_time}:00Z`;

    const paymentType = metadata.payment_type || 'full';
    const depositAmount = parseFloat(metadata.deposit_amount || '0');
    const remainingAmount = parseFloat(metadata.remaining_amount || '0');
    const totalAmount = parseFloat(metadata.total_amount || '0');

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
      .select()
      .single();

    if (insertError) {
      console.error('Error creating booking:', JSON.stringify(insertError));

      if (session.payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer',
          });
          console.log('Refund initiated due to booking creation failure');
        } catch (refundError) {
          console.error('Failed to initiate refund:', refundError);
        }
      }

      return;
    }

    await supabase
      .from('checkout_holds')
      .update({ status: 'converted' })
      .eq('stripe_session_id', session.id);

    console.log(`
      ============================================
      BOOKING CREATED - PAYMENT SUCCESSFUL
      ============================================
      Booking ID: ${newBooking.id}
      Customer: ${metadata.customer_name}
      Email: ${metadata.customer_email}
      Vehicle: ${metadata.vehicle_brand} ${metadata.vehicle_model}
      Pickup: ${pickupDateTime}
      Return: ${returnDateTime}
      Payment Type: ${paymentType}
      Amount Paid: EUR${paymentType === 'deposit' ? depositAmount : totalAmount}
      ${paymentType === 'deposit' ? `Remaining Due: EUR${remainingAmount}` : ''}
      ============================================
    `);

    try {
      const emailResponse = await fetch(
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

      if (!emailResponse.ok) {
        console.error('Failed to send confirmation email');
      } else {
        console.log('Confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment failed: ${paymentIntent.id}`);
    console.log(`Failure message: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  try {
    console.log(`Checkout session expired: ${session.id}`);

    const { error } = await supabase
      .from('checkout_holds')
      .update({ status: 'expired' })
      .eq('stripe_session_id', session.id);

    if (error) {
      console.error('Failed to update hold status:', error);
    } else {
      console.log(`Hold released for expired session: ${session.id}`);
    }
  } catch (error) {
    console.error('Error handling checkout session expired:', error);
  }
}
