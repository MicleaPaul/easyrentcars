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
    const { email, phone, fingerprint } = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (!email || !phone) {
      throw new Error('Missing required fields: email and phone');
    }

    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_ip_address: ipAddress,
        p_email: email,
        p_phone: phone,
        p_fingerprint: fingerprint || null,
      })
      .single();

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    const rateLimitResult = rateLimitData || { allowed: true, reason: 'No rate limit data', wait_seconds: 0 };

    if (!rateLimitResult.allowed) {
      await supabase.from('booking_attempts').insert({
        ip_address: ipAddress,
        email,
        phone,
        fingerprint,
        success: false,
        blocked: true,
        blocked_reason: rateLimitResult.reason,
      });

      return new Response(
        JSON.stringify({
          allowed: false,
          reason: rateLimitResult.reason,
          wait_seconds: rateLimitResult.wait_seconds,
          fraud_score: 100,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.wait_seconds),
          },
        }
      );
    }

    const { data: fraudScore, error: fraudScoreError } = await supabase
      .rpc('calculate_fraud_score', {
        p_email: email,
        p_phone: phone,
        p_ip_address: ipAddress,
        p_fingerprint: fingerprint || null,
      });

    if (fraudScoreError) {
      console.error('Fraud score calculation error:', fraudScoreError);
    }

    const score = fraudScore || 0;

    const allowed = score < 70;
    const warningLevel = score >= 50 && score < 70 ? 'medium' : score >= 70 ? 'high' : 'low';

    await supabase.from('booking_attempts').insert({
      ip_address: ipAddress,
      email,
      phone,
      fingerprint,
      success: allowed,
      blocked: !allowed,
      blocked_reason: !allowed ? `Fraud score too high: ${score}` : null,
    });

    return new Response(
      JSON.stringify({
        allowed,
        fraud_score: score,
        warning_level: warningLevel,
        reasons: {
          disposable_email: score >= 50,
          blacklisted: score >= 100,
          new_customer: score >= 20,
          rate_limit_exceeded: false,
        },
        message: !allowed
          ? 'Your booking request has been flagged for review. Please contact support.'
          : score >= 50
            ? 'Your booking may require additional verification.'
            : 'Booking allowed',
      }),
      {
        status: allowed ? 200 : 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error checking fraud score:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
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
