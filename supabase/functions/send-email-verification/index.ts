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

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'info@easyrentcars.rentals';
const FROM_NAME = 'EasyRentCars';

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { booking_id, email, language = 'en' } = await req.json();

    if (!booking_id || !email) {
      throw new Error('Missing required fields: booking_id and email');
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    const { data: verification, error: verificationError } = await supabase
      .from('email_verifications')
      .insert({
        booking_id,
        email,
        token,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      })
      .select()
      .single();

    if (verificationError) throw verificationError;

    const verificationLink = `${Deno.env.get('SITE_URL')}/verify-email?token=${token}`;

    const emailSubject = {
      en: 'Confirm Your Booking - EasyRentCars',
      de: 'Bestaetigen Sie Ihre Buchung - EasyRentCars',
      fr: 'Confirmez Votre Reservation - EasyRentCars',
    }[language] || 'Confirm Your Booking - EasyRentCars';

    const emailBody = {
      en: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;background:#f5f5f5}.container{background:#fff;border-radius:12px;overflow:hidden;margin:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#0B0C0F 0%,#1a1d21 100%);color:#fff;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:28px;color:#D4AF37}.gold-bar{height:4px;background:linear-gradient(90deg,#D4AF37,#F4D03F,#D4AF37)}.content{padding:40px 30px}.button{display:inline-block;padding:16px 32px;background-color:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;margin:20px 0;text-align:center}.link-box{background:#f8f8f8;padding:15px;border-radius:8px;word-break:break-all;margin:20px 0;font-family:monospace;font-size:14px;border:1px solid #ddd}.warning{background:#FFF8E1;border-left:4px solid #FFB300;padding:15px;margin:20px 0;border-radius:4px}.footer{background:#0B0C0F;color:#999;text-align:center;padding:30px;font-size:14px}</style></head><body><div class="container"><div class="header"><h1>EasyRentCars</h1><p style="margin:10px 0 0;opacity:0.9">Premium Car Rental Service</p></div><div class="gold-bar"></div><div class="content"><h2 style="color:#0B0C0F;margin:0 0 20px">Confirm Your Email Address</h2><p>Thank you for choosing EasyRentCars! To complete your booking, please verify your email address.</p><p>Click the button below to verify your email:</p><div style="text-align:center"><a href="${verificationLink}" class="button">Verify Email</a></div><p>Or copy and paste this link into your browser:</p><div class="link-box">${verificationLink}</div><div class="warning"><strong>⏱️ This link will expire in 20 minutes.</strong></div><p style="color:#666;font-size:14px">If you didn't request this booking, please ignore this email.</p></div><div class="footer"><p style="margin:0;font-size:12px;color:#666">EasyRentCars | Alte Poststrasse 152, 8020 Graz, Austria</p><p style="margin:5px 0 0;font-size:12px"><a href="mailto:info@easyrentcars.rentals" style="color:#D4AF37;text-decoration:none">info@easyrentcars.rentals</a> | <a href="tel:+436704070707" style="color:#D4AF37;text-decoration:none">+43 670 40 70 707</a></p></div></div></body></html>`,
      de: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;background:#f5f5f5}.container{background:#fff;border-radius:12px;overflow:hidden;margin:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#0B0C0F 0%,#1a1d21 100%);color:#fff;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:28px;color:#D4AF37}.gold-bar{height:4px;background:linear-gradient(90deg,#D4AF37,#F4D03F,#D4AF37)}.content{padding:40px 30px}.button{display:inline-block;padding:16px 32px;background-color:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;margin:20px 0;text-align:center}.link-box{background:#f8f8f8;padding:15px;border-radius:8px;word-break:break-all;margin:20px 0;font-family:monospace;font-size:14px;border:1px solid #ddd}.warning{background:#FFF8E1;border-left:4px solid#FFB300;padding:15px;margin:20px 0;border-radius:4px}.footer{background:#0B0C0F;color:#999;text-align:center;padding:30px;font-size:14px}</style></head><body><div class="container"><div class="header"><h1>EasyRentCars</h1><p style="margin:10px 0 0;opacity:0.9">Premium Autovermietung</p></div><div class="gold-bar"></div><div class="content"><h2 style="color:#0B0C0F;margin:0 0 20px">Bestaetigen Sie Ihre E-Mail-Adresse</h2><p>Vielen Dank, dass Sie sich fuer EasyRentCars entschieden haben! Um Ihre Buchung abzuschliessen, verifizieren Sie bitte Ihre E-Mail-Adresse.</p><p>Klicken Sie auf die Schaltflaeche unten, um Ihre E-Mail zu verifizieren:</p><div style="text-align:center"><a href="${verificationLink}" class="button">E-Mail Verifizieren</a></div><p>Oder kopieren Sie diesen Link in Ihren Browser:</p><div class="link-box">${verificationLink}</div><div class="warning"><strong>⏱️ Dieser Link laeuft in 20 Minuten ab.</strong></div><p style="color:#666;font-size:14px">Wenn Sie diese Buchung nicht angefordert haben, ignorieren Sie bitte diese E-Mail.</p></div><div class="footer"><p style="margin:0;font-size:12px;color:#666">EasyRentCars | Alte Poststrasse 152, 8020 Graz, Austria</p><p style="margin:5px 0 0;font-size:12px"><a href="mailto:info@easyrentcars.rentals" style="color:#D4AF37;text-decoration:none">info@easyrentcars.rentals</a> | <a href="tel:+436704070707" style="color:#D4AF37;text-decoration:none">+43 670 40 70 707</a></p></div></div></body></html>`,
    }[language] || emailBody.en;

    let emailSent = false;
    let emailError = null;

    if (RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [email],
            subject: emailSubject,
            html: emailBody,
          }),
        });

        if (resendResponse.ok) {
          const result = await resendResponse.json();
          console.log('Verification email sent successfully via Resend:', result);
          emailSent = true;
        } else {
          const errorData = await resendResponse.json();
          console.error('Resend API error:', errorData);
          emailError = errorData;
        }
      } catch (err) {
        console.error('Error sending email via Resend:', err);
        emailError = err;
      }
    } else {
      console.log('RESEND_API_KEY not configured. Verification link:', verificationLink);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: emailSent
          ? 'Verification email sent successfully'
          : 'Verification created (email not sent - Resend API key not configured)',
        verification_id: verification.id,
        expires_at: expiresAt.toISOString(),
        email_sent: emailSent,
        error: emailError,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while sending the verification email' }),
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