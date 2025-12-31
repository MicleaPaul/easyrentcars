import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.14.0";

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

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const { amount, bookingDetails } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        service: "EasyRentCars",
        created_via: "supabase_edge_function",
        ...(bookingDetails && {
          booking_id: bookingDetails.booking_id,
          vehicle_brand: bookingDetails.vehicle_brand,
          vehicle_model: bookingDetails.vehicle_model,
          customer_name: bookingDetails.customer_name,
          customer_email: bookingDetails.customer_email,
          pickup_date: bookingDetails.pickup_date,
          return_date: bookingDetails.return_date,
          rental_days: bookingDetails.rental_days?.toString(),
          price_per_day: bookingDetails.price_per_day?.toString(),
        }),
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error creating payment intent:", error);

    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your payment request",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});