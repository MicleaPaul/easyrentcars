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

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      throw new Error('Missing token');
    }

    const { data: verification, error: verificationError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .single();

    if (verificationError || !verification) {
      throw new Error('Invalid verification token');
    }

    if (verification.verified) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email already verified',
          booking_id: verification.booking_id,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const now = new Date();
    const expiresAt = new Date(verification.expires_at);

    if (now > expiresAt) {
      await supabase
        .from('bookings')
        .update({
          booking_status: 'Expired',
          expired_at: now.toISOString(),
        })
        .eq('id', verification.booking_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Verification token expired',
          booking_id: verification.booking_id,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { error: updateVerificationError } = await supabase
      .from('email_verifications')
      .update({
        verified: true,
        verified_at: now.toISOString(),
        attempts: verification.attempts + 1,
      })
      .eq('id', verification.id);

    if (updateVerificationError) throw updateVerificationError;

    const { error: updateBookingError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'PendingPayment',
        email_verified_at: now.toISOString(),
      })
      .eq('id', verification.booking_id);

    if (updateBookingError) throw updateBookingError;

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', verification.booking_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email verified successfully',
        booking_id: verification.booking_id,
        redirect_url: `/verify-card?booking_id=${verification.booking_id}`,
        booking: booking,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error verifying email token:', error);
    const safeMessages = ['Invalid verification token', 'Missing token'];
    const safeMessage = safeMessages.includes(error.message)
      ? error.message
      : 'An error occurred while verifying the email';
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
