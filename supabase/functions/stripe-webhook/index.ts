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
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case 'setup_intent.succeeded':
      await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`Processing checkout.session.completed: ${session.id}`);

    const bookingId = session.metadata?.booking_id || session.client_reference_id;

    if (!bookingId) {
      console.error('No booking_id in session metadata or client_reference_id');
      return;
    }

    const paymentType = session.metadata?.payment_type || 'full';
    const depositAmount = parseFloat(session.metadata?.deposit_amount || '0');
    const remainingAmount = parseFloat(session.metadata?.remaining_amount || '0');

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', booking.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Vehicle not found:', booking.vehicle_id);
      return;
    }

    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .neq('id', bookingId)
      .eq('vehicle_id', booking.vehicle_id)
      .in('booking_status', ['Confirmed', 'Active', 'confirmed', 'active'])
      .or(`pickup_date.lt.${booking.return_date},return_date.gt.${booking.pickup_date}`);

    if (conflictingBookings && conflictingBookings.length > 0) {
      console.error('Vehicle no longer available - refund needed');

      await supabase
        .from('bookings')
        .update({
          booking_status: 'Cancelled',
          notes: (booking.notes || '') + '\n[System] Vehicle was booked by another customer. Refund initiated.',
        })
        .eq('id', bookingId);

      return;
    }

    const updateData: any = {
      booking_status: 'Confirmed',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
    };

    if (paymentType === 'deposit') {
      updateData.payment_status = 'partial';
      updateData.deposit_amount = depositAmount;
      updateData.remaining_amount = remainingAmount;
      updateData.deposit_paid_at = new Date().toISOString();
    } else {
      updateData.payment_status = 'paid';
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return;
    }

    console.log(`
      ============================================
      BOOKING CONFIRMED - PAYMENT SUCCESSFUL
      ============================================
      Booking ID: ${bookingId}
      Customer: ${booking.customer_name}
      Email: ${booking.customer_email}
      Vehicle: ${vehicle.brand} ${vehicle.model}
      Pickup: ${booking.pickup_date}
      Return: ${booking.return_date}
      Payment Type: ${paymentType}
      Amount Paid: EUR${paymentType === 'deposit' ? depositAmount : booking.total_price}
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
          body: JSON.stringify({ booking_id: bookingId }),
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

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment intent succeeded: ${paymentIntent.id}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment failed: ${paymentIntent.id}`);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (error || !bookings) {
      console.log('No booking found for failed payment intent');
      return;
    }

    await supabase
      .from('bookings')
      .update({
        payment_status: 'failed',
        notes: `[System] Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
      })
      .eq('id', bookings.id);

    console.log(`Booking ${bookings.id} marked as payment failed`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  try {
    console.info(`Processing setup_intent.succeeded: ${setupIntent.id}`);

    const bookingId = setupIntent.metadata?.booking_id;

    if (!bookingId) {
      console.error('No booking_id in setup_intent metadata');
      return;
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('stripe_setup_intent_id', setupIntent.id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found for setup_intent:', setupIntent.id);
      return;
    }

    if (booking.booking_status !== 'PendingPayment') {
      console.error(`Invalid booking status: ${booking.booking_status}. Expected PendingPayment.`);
      return;
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', booking.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Vehicle not found:', booking.vehicle_id);
      return;
    }

    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', booking.vehicle_id)
      .in('booking_status', ['Confirmed', 'Active'])
      .or(`pickup_date.lte.${booking.return_date},return_date.gte.${booking.pickup_date}`);

    if (conflictingBookings && conflictingBookings.length > 0) {
      console.error('Vehicle no longer available for these dates');

      await supabase
        .from('bookings')
        .update({
          booking_status: 'Cancelled',
          notes: (booking.notes || '') + '\n[System] Vehicle no longer available. Card was not charged.',
        })
        .eq('id', booking.id);

      return;
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'Confirmed',
        card_verified_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        stripe_payment_method_id: setupIntent.payment_method as string,
        payment_status: 'pending',
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return;
    }

    console.info(`Successfully confirmed booking: ${booking.id}`);
  } catch (error) {
    console.error('Error handling setup_intent.succeeded:', error);
  }
}