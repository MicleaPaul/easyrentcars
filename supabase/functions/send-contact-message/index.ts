import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

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

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'info@easyrentcars.rentals';
const FROM_NAME = 'EasyRentCars Contact Form';
const TO_EMAIL = 'easyrentgraz@gmail.com';

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, phone, message, language = 'en' } = await req.json();

    if (!name || !email || !message) {
      throw new Error('Missing required fields: name, email, and message');
    }

    const translations: Record<string, Record<string, string>> = {
      en: {
        subject: 'New Contact Form Message - EasyRentCars',
        title: 'New Contact Form Submission',
        intro: 'You have received a new message from your website contact form.',
        customerDetails: 'Customer Details',
        customerName: 'Name',
        customerEmail: 'Email',
        customerPhone: 'Phone',
        customerMessage: 'Message',
        footer: 'This message was sent from the EasyRentCars website contact form.',
      },
      de: {
        subject: 'Neue Kontaktformular-Nachricht - EasyRentCars',
        title: 'Neue Kontaktformular-Übermittlung',
        intro: 'Sie haben eine neue Nachricht von Ihrem Website-Kontaktformular erhalten.',
        customerDetails: 'Kundendetails',
        customerName: 'Name',
        customerEmail: 'E-Mail',
        customerPhone: 'Telefon',
        customerMessage: 'Nachricht',
        footer: 'Diese Nachricht wurde über das Kontaktformular der EasyRentCars-Website gesendet.',
      },
      ro: {
        subject: 'Mesaj nou din formularul de contact - EasyRentCars',
        title: 'Nou formular de contact trimis',
        intro: 'Ați primit un mesaj nou din formularul de contact de pe site-ul dvs.',
        customerDetails: 'Detalii client',
        customerName: 'Nume',
        customerEmail: 'Email',
        customerPhone: 'Telefon',
        customerMessage: 'Mesaj',
        footer: 'Acest mesaj a fost trimis din formularul de contact al site-ului EasyRentCars.',
      },
      fr: {
        subject: 'Nouveau message du formulaire de contact - EasyRentCars',
        title: 'Nouvelle soumission du formulaire de contact',
        intro: 'Vous avez reçu un nouveau message de votre formulaire de contact sur le site Web.',
        customerDetails: 'Détails du client',
        customerName: 'Nom',
        customerEmail: 'Email',
        customerPhone: 'Téléphone',
        customerMessage: 'Message',
        footer: 'Ce message a été envoyé depuis le formulaire de contact du site Web EasyRentCars.',
      },
      it: {
        subject: 'Nuovo messaggio dal modulo di contatto - EasyRentCars',
        title: 'Nuovo invio del modulo di contatto',
        intro: 'Hai ricevuto un nuovo messaggio dal modulo di contatto del tuo sito web.',
        customerDetails: 'Dettagli cliente',
        customerName: 'Nome',
        customerEmail: 'Email',
        customerPhone: 'Telefono',
        customerMessage: 'Messaggio',
        footer: 'Questo messaggio è stato inviato dal modulo di contatto del sito web EasyRentCars.',
      },
      es: {
        subject: 'Nuevo mensaje del formulario de contacto - EasyRentCars',
        title: 'Nuevo envío del formulario de contacto',
        intro: 'Ha recibido un nuevo mensaje del formulario de contacto de su sitio web.',
        customerDetails: 'Detalles del cliente',
        customerName: 'Nombre',
        customerEmail: 'Email',
        customerPhone: 'Teléfono',
        customerMessage: 'Mensaje',
        footer: 'Este mensaje fue enviado desde el formulario de contacto del sitio web EasyRentCars.',
      },
    };

    const t = translations[language] || translations.en;

    const emailBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 0 auto;
      background: #f5f5f5;
    }
    .container {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      margin: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #0B0C0F 0%, #1a1d21 100%);
      color: #fff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #D4AF37;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .gold-bar {
      height: 4px;
      background: linear-gradient(90deg, #D4AF37, #F4D03F, #D4AF37);
    }
    .content {
      padding: 30px;
    }
    .section {
      background: #fafafa;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      border-left: 4px solid #D4AF37;
    }
    .section-title {
      color: #0B0C0F;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-item {
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 15px;
      color: #333;
      font-weight: 600;
    }
    .message-box {
      background: #fff;
      border: 2px solid #D4AF37;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .reply-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      color: #000;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background: #0B0C0F;
      color: #999;
      text-align: center;
      padding: 30px;
      font-size: 14px;
    }
    .footer a {
      color: #D4AF37;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EasyRentCars</h1>
      <p>${t.title}</p>
    </div>
    <div class="gold-bar"></div>
    <div class="content">
      <p style="color: #666; font-size: 16px; margin-bottom: 25px;">${t.intro}</p>
      
      <div class="section">
        <div class="section-title">${t.customerDetails}</div>
        
        <div class="info-item">
          <div class="info-label">${t.customerName}</div>
          <div class="info-value">${name}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">${t.customerEmail}</div>
          <div class="info-value">
            <a href="mailto:${email}" style="color: #D4AF37; text-decoration: none;">${email}</a>
          </div>
        </div>
        
        ${phone ? `
        <div class="info-item">
          <div class="info-label">${t.customerPhone}</div>
          <div class="info-value">
            <a href="tel:${phone}" style="color: #D4AF37; text-decoration: none;">${phone}</a>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">${t.customerMessage}</div>
        <div class="message-box">${message}</div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${email}?subject=Re: Your inquiry to EasyRentCars" class="reply-button">
          Reply to ${name}
        </a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0; font-size: 12px; color: #666;">${t.footer}</p>
      <p style="margin: 10px 0 0; font-size: 12px;">
        <a href="mailto:info@easyrentcars.rentals">info@easyrentcars.rentals</a> |
        <a href="tel:+436704070707">+43 670 40 70 707</a>
      </p>
      <p style="margin: 10px 0 0; font-size: 12px; color: #666;">
        EasyRentCars | Alte Poststrasse 152, 8020 Graz, Austria
      </p>
    </div>
  </div>
</body>
</html>`;

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
            to: [TO_EMAIL],
            reply_to: email,
            subject: t.subject,
            html: emailBody,
          }),
        });

        if (resendResponse.ok) {
          const result = await resendResponse.json();
          console.log('Contact message sent successfully via Resend:', result);
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
      console.log('RESEND_API_KEY not configured.');
      emailError = 'RESEND_API_KEY not configured';
    }

    return new Response(
      JSON.stringify({
        success: emailSent,
        message: emailSent
          ? 'Contact message sent successfully'
          : 'Failed to send contact message',
        email_sent: emailSent,
        error: emailError,
      }),
      {
        status: emailSent ? 200 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while processing your message'
      }),
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
