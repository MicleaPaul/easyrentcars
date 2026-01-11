import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'info@easyrentcars.rentals';
const FROM_NAME = 'EasyRentCars';
const BUSINESS_EMAIL = 'easyrentgraz@gmail.com';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { booking_id } = await req.json();

    if (!booking_id) {
      throw new Error('Missing required field: booking_id');
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicles:vehicle_id (
          brand,
          model,
          year,
          transmission,
          fuel_type,
          seats,
          price_per_day
        )
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError) throw bookingError;
    if (!booking) throw new Error('Booking not found');

    const vehicle = booking.vehicles;
    const language = booking.language || 'en';

    const formatDate = (dateString: string, lang: string) => {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const localeMap: Record<string, string> = {
        de: 'de-AT',
        en: 'en-US',
        fr: 'fr-FR',
        it: 'it-IT',
        es: 'es-ES',
        ro: 'ro-RO'
      };
      return date.toLocaleDateString(localeMap[lang] || 'en-US', options);
    };

    const translations: Record<string, Record<string, string>> = {
      en: {
        subject: 'Booking Confirmation - EasyRentCars Graz',
        title: 'Booking Confirmation',
        thankYou: 'Thank you for choosing EasyRentCars!',
        bookingId: 'Booking ID',
        vehicle: 'Vehicle',
        pickup: 'Pickup',
        return: 'Return',
        location: 'Location',
        date: 'Date & Time',
        customerInfo: 'Customer Information',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        pricing: 'Price Breakdown',
        rental: 'Rental Cost',
        days: 'days',
        day: 'day',
        cleaningFee: 'Cleaning Fee',
        locationFee: 'Location Fees',
        afterHoursFee: 'After Hours Service',
        unlimitedKm: 'Unlimited Kilometers',
        total: 'Total',
        depositPaid: 'Deposit Paid Online',
        remainingDue: 'Remaining Due at Pickup',
        paymentMethod: 'Payment Method',
        creditCard: 'Credit Card',
        cash: 'Cash',
        notes: 'Additional Notes',
        importantInfo: 'What to Bring at Pickup',
        bringDocuments: 'Required documents:',
        doc1: 'Valid driving license',
        doc2: 'ID card or passport',
        paymentInfoTitle: 'Payment Information',
        paymentInfoCashOnline: 'Paid online (deposit for 1 day rental)',
        paymentInfoCashRemaining: 'To be paid in CASH at pickup',
        paymentInfoCardComplete: 'Full payment completed online',
        paymentInfoCardNoAdditional: 'No additional payment required at pickup',
        questions: 'Questions? Contact us:',
        footer: 'Thank you for your business!'
      },
      de: {
        subject: 'Buchungsbestaetigung - EasyRentCars Graz',
        title: 'Buchungsbestaetigung',
        thankYou: 'Vielen Dank, dass Sie sich fuer EasyRentCars entschieden haben!',
        bookingId: 'Buchungs-ID',
        vehicle: 'Fahrzeug',
        pickup: 'Abholung',
        return: 'Rueckgabe',
        location: 'Ort',
        date: 'Datum & Uhrzeit',
        customerInfo: 'Kundeninformationen',
        name: 'Name',
        email: 'E-Mail',
        phone: 'Telefon',
        pricing: 'Preisaufschluesselung',
        rental: 'Mietkosten',
        days: 'Tage',
        day: 'Tag',
        cleaningFee: 'Reinigungsgebuehr',
        locationFee: 'Standortgebuehren',
        afterHoursFee: 'Ausserhalb der Geschaeftszeiten',
        unlimitedKm: 'Unbegrenzte Kilometer',
        total: 'Gesamt',
        depositPaid: 'Online bezahlte Anzahlung',
        remainingDue: 'Restbetrag bei Abholung',
        paymentMethod: 'Zahlungsmethode',
        creditCard: 'Kreditkarte',
        cash: 'Bargeld',
        notes: 'Zusaetzliche Hinweise',
        importantInfo: 'Was Sie zur Abholung mitbringen muessen',
        bringDocuments: 'Erforderliche Dokumente:',
        doc1: 'Gueltiger Fuehrerschein',
        doc2: 'Personalausweis oder Reisepass',
        paymentInfoTitle: 'Zahlungsinformationen',
        paymentInfoCashOnline: 'Online bezahlt (Anzahlung fuer 1 Tag Miete)',
        paymentInfoCashRemaining: 'In BAR bei Abholung zu zahlen',
        paymentInfoCardComplete: 'Vollstaendige Zahlung online abgeschlossen',
        paymentInfoCardNoAdditional: 'Keine zusaetzliche Zahlung bei Abholung erforderlich',
        questions: 'Fragen? Kontaktieren Sie uns:',
        footer: 'Vielen Dank fuer Ihr Vertrauen!'
      },
      ro: {
        subject: 'Confirmare Rezervare - EasyRentCars Graz',
        title: 'Confirmare Rezervare',
        thankYou: 'Va multumim ca ati ales EasyRentCars!',
        bookingId: 'ID Rezervare',
        vehicle: 'Vehicul',
        pickup: 'Preluare',
        return: 'Returnare',
        location: 'Locatie',
        date: 'Data & Ora',
        customerInfo: 'Informatii Client',
        name: 'Nume',
        email: 'Email',
        phone: 'Telefon',
        pricing: 'Detalii Pret',
        rental: 'Cost Inchiriere',
        days: 'zile',
        day: 'zi',
        cleaningFee: 'Taxa Curatenie',
        locationFee: 'Taxe Locatie',
        afterHoursFee: 'Serviciu in Afara Programului',
        unlimitedKm: 'Kilometri Nelimitati',
        total: 'Total',
        depositPaid: 'Avans Platit Online',
        remainingDue: 'Rest de Plata la Preluare',
        paymentMethod: 'Metoda de Plata',
        creditCard: 'Card de Credit',
        cash: 'Numerar',
        notes: 'Note Suplimentare',
        importantInfo: 'Ce Trebuie Sa Aduceti la Preluare',
        bringDocuments: 'Documente necesare:',
        doc1: 'Permis de conducere valid',
        doc2: 'Carte de identitate sau pasaport',
        paymentInfoTitle: 'Informatii Plata',
        paymentInfoCashOnline: 'Platit online (avans pentru 1 zi de inchiriere)',
        paymentInfoCashRemaining: 'De platit in NUMERAR la preluare',
        paymentInfoCardComplete: 'Plata completa efectuata online',
        paymentInfoCardNoAdditional: 'Nu este necesara nicio plata suplimentara la preluare',
        questions: 'Intrebari? Contactati-ne:',
        footer: 'Va multumim pentru incredere!'
      },
      fr: {
        subject: 'Confirmation de Reservation - EasyRentCars Graz',
        title: 'Confirmation de Reservation',
        thankYou: 'Merci d\'avoir choisi EasyRentCars!',
        bookingId: 'ID de Reservation',
        vehicle: 'Vehicule',
        pickup: 'Prise en charge',
        return: 'Retour',
        location: 'Lieu',
        date: 'Date & Heure',
        customerInfo: 'Informations Client',
        name: 'Nom',
        email: 'Email',
        phone: 'Telephone',
        pricing: 'Details du Prix',
        rental: 'Cout de Location',
        days: 'jours',
        day: 'jour',
        cleaningFee: 'Frais de Nettoyage',
        locationFee: 'Frais de Lieu',
        afterHoursFee: 'Service en Dehors des Heures',
        unlimitedKm: 'Kilometres Illimites',
        total: 'Total',
        depositPaid: 'Acompte Paye en Ligne',
        remainingDue: 'Reste du a la Prise en Charge',
        paymentMethod: 'Mode de Paiement',
        creditCard: 'Carte de Credit',
        cash: 'Especes',
        notes: 'Notes Supplementaires',
        importantInfo: 'Ce qu\'il Faut Apporter a la Prise en Charge',
        bringDocuments: 'Documents requis:',
        doc1: 'Permis de conduire valide',
        doc2: 'Carte d\'identite ou passeport',
        paymentInfoTitle: 'Informations de Paiement',
        paymentInfoCashOnline: 'Paye en ligne (acompte pour 1 jour de location)',
        paymentInfoCashRemaining: 'A payer en ESPECES a la prise en charge',
        paymentInfoCardComplete: 'Paiement integral effectue en ligne',
        paymentInfoCardNoAdditional: 'Aucun paiement supplementaire requis a la prise en charge',
        questions: 'Questions? Contactez-nous:',
        footer: 'Merci pour votre confiance!'
      },
      it: {
        subject: 'Conferma Prenotazione - EasyRentCars Graz',
        title: 'Conferma Prenotazione',
        thankYou: 'Grazie per aver scelto EasyRentCars!',
        bookingId: 'ID Prenotazione',
        vehicle: 'Veicolo',
        pickup: 'Ritiro',
        return: 'Restituzione',
        location: 'Luogo',
        date: 'Data & Ora',
        customerInfo: 'Informazioni Cliente',
        name: 'Nome',
        email: 'Email',
        phone: 'Telefono',
        pricing: 'Dettagli Prezzo',
        rental: 'Costo Noleggio',
        days: 'giorni',
        day: 'giorno',
        cleaningFee: 'Spese di Pulizia',
        locationFee: 'Spese di Posizione',
        afterHoursFee: 'Servizio Fuori Orario',
        unlimitedKm: 'Chilometri Illimitati',
        total: 'Totale',
        depositPaid: 'Acconto Pagato Online',
        remainingDue: 'Saldo da Pagare al Ritiro',
        paymentMethod: 'Metodo di Pagamento',
        creditCard: 'Carta di Credito',
        cash: 'Contanti',
        notes: 'Note Aggiuntive',
        importantInfo: 'Cosa Portare al Ritiro',
        bringDocuments: 'Documenti richiesti:',
        doc1: 'Patente di guida valida',
        doc2: 'Carta d\'identita o passaporto',
        paymentInfoTitle: 'Informazioni di Pagamento',
        paymentInfoCashOnline: 'Pagato online (acconto per 1 giorno di noleggio)',
        paymentInfoCashRemaining: 'Da pagare in CONTANTI al ritiro',
        paymentInfoCardComplete: 'Pagamento completo effettuato online',
        paymentInfoCardNoAdditional: 'Nessun pagamento aggiuntivo richiesto al ritiro',
        questions: 'Domande? Contattaci:',
        footer: 'Grazie per la vostra fiducia!'
      },
      es: {
        subject: 'Confirmacion de Reserva - EasyRentCars Graz',
        title: 'Confirmacion de Reserva',
        thankYou: 'Gracias por elegir EasyRentCars!',
        bookingId: 'ID de Reserva',
        vehicle: 'Vehiculo',
        pickup: 'Recogida',
        return: 'Devolucion',
        location: 'Ubicacion',
        date: 'Fecha & Hora',
        customerInfo: 'Informacion del Cliente',
        name: 'Nombre',
        email: 'Email',
        phone: 'Telefono',
        pricing: 'Desglose de Precios',
        rental: 'Costo de Alquiler',
        days: 'dias',
        day: 'dia',
        cleaningFee: 'Tarifa de Limpieza',
        locationFee: 'Tarifas de Ubicacion',
        afterHoursFee: 'Servicio Fuera de Horario',
        unlimitedKm: 'Kilometros Ilimitados',
        total: 'Total',
        depositPaid: 'Deposito Pagado en Linea',
        remainingDue: 'Resto a Pagar en la Recogida',
        paymentMethod: 'Metodo de Pago',
        creditCard: 'Tarjeta de Credito',
        cash: 'Efectivo',
        notes: 'Notas Adicionales',
        importantInfo: 'Que Traer en la Recogida',
        bringDocuments: 'Documentos requeridos:',
        doc1: 'Licencia de conducir valida',
        doc2: 'Documento de identidad o pasaporte',
        paymentInfoTitle: 'Informacion de Pago',
        paymentInfoCashOnline: 'Pagado en linea (deposito por 1 dia de alquiler)',
        paymentInfoCashRemaining: 'A pagar en EFECTIVO en la recogida',
        paymentInfoCardComplete: 'Pago completo realizado en linea',
        paymentInfoCardNoAdditional: 'No se requiere pago adicional en la recogida',
        questions: 'Preguntas? Contactanos:',
        footer: 'Gracias por su confianza!'
      }
    };

    const t = translations[language] || translations.en;

    const pickupDate = formatDate(booking.pickup_date, language);
    const returnDate = formatDate(booking.return_date, language);

    const days = booking.rental_days || 1;
    const rentalCost = booking.rental_cost || 0;
    const locationFees = (booking.pickup_fee || 0) + (booking.return_fee || 0);
    const unlimitedKmFee = booking.unlimited_km_fee || 0;
    const isPartialPayment = booking.payment_status === 'partial';
    const depositAmount = booking.deposit_amount || 0;
    const remainingAmount = booking.remaining_amount || 0;
    const isCashPayment = booking.payment_method === 'cash';

    const paymentInfoSection = isCashPayment
      ? `<div style="background:#FFF8E1;border:2px solid #FFB300;padding:20px;border-radius:8px;margin:20px 0"><h3 style="color:#E65100;margin:0 0 15px;font-size:16px">${t.paymentInfoTitle}</h3><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #FFE082"><span style="font-size:14px">${t.paymentInfoCashOnline}</span><span style="color:#2E7D32;font-weight:bold;font-size:16px">EUR ${depositAmount.toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:14px;font-weight:600">${t.paymentInfoCashRemaining}</span><span style="color:#E65100;font-weight:bold;font-size:20px">EUR ${remainingAmount.toFixed(2)}</span></div></div>`
      : `<div style="background:#E8F5E9;border:2px solid #4CAF50;padding:20px;border-radius:8px;margin:20px 0"><h3 style="color:#2E7D32;margin:0 0 15px;font-size:16px">${t.paymentInfoTitle}</h3><div style="display:flex;align-items:center;margin-bottom:12px"><svg style="width:24px;height:24px;margin-right:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span style="font-size:14px">${t.paymentInfoCardComplete}</span></div><div style="display:flex;align-items:center"><svg style="width:24px;height:24px;margin-right:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span style="font-size:14px;font-weight:600">${t.paymentInfoCardNoAdditional}</span></div></div>`;

    const emailBody = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;max-width:650px;margin:0 auto;background:#f5f5f5}.container{background:#fff;border-radius:12px;overflow:hidden;margin:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#0B0C0F 0%,#1a1d21 100%);color:#fff;padding:40px 30px;text-align:center}.header h1{margin:0;font-size:28px;color:#D4AF37}.header p{margin:10px 0 0;opacity:0.9;font-size:16px}.gold-bar{height:4px;background:linear-gradient(90deg,#D4AF37,#F4D03F,#D4AF37)}.content{padding:30px}.section{background:#fafafa;padding:20px;margin-bottom:20px;border-radius:8px;border-left:4px solid #D4AF37}.section-title{color:#0B0C0F;font-size:16px;font-weight:bold;margin-bottom:15px;text-transform:uppercase;letter-spacing:1px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.info-item{padding:8px 0}.info-label{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px}.info-value{font-size:15px;color:#333;font-weight:600;margin-top:4px}.price-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee}.total-row{font-size:20px;font-weight:bold;color:#D4AF37;padding:15px 0;border-top:2px solid #D4AF37;margin-top:10px;background:#0B0C0F;margin:15px -20px -20px;padding:20px;border-radius:0 0 4px 4px}.total-row span:last-child{color:#F4D03F}.deposit-info{background:#FFF8E1;border:1px solid #FFE082;padding:15px;border-radius:8px;margin-top:15px}.important-box{background:#E3F2FD;border:2px solid #2196F3;padding:20px;border-radius:8px;margin:20px 0}.important-box h3{color:#1565C0;margin:0 0 15px;font-size:16px}.important-box ul{margin:0;padding-left:20px;list-style:none}.important-box li{margin:8px 0;color:#333;padding-left:30px;position:relative}.important-box li:before{content:"check";position:absolute;left:0;color:#2196F3;font-weight:bold;font-size:18px}.footer{background:#0B0C0F;color:#999;text-align:center;padding:30px;font-size:14px}.footer a{color:#D4AF37;text-decoration:none}.booking-id{font-family:'Courier New',monospace;background:#0B0C0F;color:#D4AF37;padding:10px 20px;border-radius:4px;display:inline-block;font-size:18px;letter-spacing:2px}</style></head><body><div class="container"><div class="header"><h1>EasyRentCars</h1><p>Premium Car Rental Service</p></div><div class="gold-bar"></div><div class="content"><div style="text-align:center;margin-bottom:30px"><h2 style="color:#0B0C0F;margin:0 0 10px">${t.title}</h2><p style="color:#666;margin:0">${t.thankYou}</p></div><div style="text-align:center;margin-bottom:30px"><p style="color:#666;margin:0 0 10px;font-size:14px">${t.bookingId}</p><div class="booking-id">${booking.id.slice(0, 8).toUpperCase()}</div></div><div class="section"><div class="section-title">${t.vehicle}</div><div style="font-size:22px;font-weight:bold;color:#0B0C0F">${vehicle.brand} ${vehicle.model}</div><div style="color:#666;margin-top:5px">${vehicle.year} | ${vehicle.transmission} | ${vehicle.fuel_type}</div></div><div class="section"><div class="section-title">${t.pickup}</div><div class="info-grid"><div class="info-item"><div class="info-label">${t.date}</div><div class="info-value">${pickupDate}</div></div><div class="info-item"><div class="info-label">${t.location}</div><div class="info-value">${booking.pickup_location}</div>${booking.pickup_location_address ? `<div style="font-size:13px;color:#D4AF37;margin-top:6px;font-style:italic;line-height:1.4">${booking.pickup_location_address}</div>` : ''}</div></div></div><div class="section"><div class="section-title">${t.return}</div><div class="info-grid"><div class="info-item"><div class="info-label">${t.date}</div><div class="info-value">${returnDate}</div></div><div class="info-item"><div class="info-label">${t.location}</div><div class="info-value">${booking.return_location}</div>${booking.return_location_address ? `<div style="font-size:13px;color:#D4AF37;margin-top:6px;font-style:italic;line-height:1.4">${booking.return_location_address}</div>` : ''}</div></div></div><div class="section"><div class="section-title">${t.customerInfo}</div><div class="info-grid"><div class="info-item"><div class="info-label">${t.name}</div><div class="info-value">${booking.customer_name}</div></div><div class="info-item"><div class="info-label">${t.email}</div><div class="info-value">${booking.customer_email}</div></div><div class="info-item"><div class="info-label">${t.phone}</div><div class="info-value">${booking.customer_phone}</div></div><div class="info-item"><div class="info-label">${t.paymentMethod}</div><div class="info-value">${booking.payment_method === 'stripe' ? t.creditCard : t.cash}</div></div></div></div><div class="section"><div class="section-title">${t.pricing}</div><div class="price-row"><span>${t.rental} (${days} ${days === 1 ? t.day : t.days})</span><span>EUR ${rentalCost.toFixed(2)}</span></div><div class="price-row"><span>${t.cleaningFee}</span><span>EUR ${(booking.cleaning_fee || 7).toFixed(2)}</span></div>${locationFees > 0 ? `<div class="price-row"><span>${t.locationFee}</span><span>EUR ${locationFees.toFixed(2)}</span></div>` : ''}${(booking.after_hours_fee || 0) > 0 ? `<div class="price-row"><span>${t.afterHoursFee}</span><span>EUR ${booking.after_hours_fee.toFixed(2)}</span></div>` : ''}${unlimitedKmFee > 0 ? `<div class="price-row"><span>${t.unlimitedKm}</span><span>EUR ${unlimitedKmFee.toFixed(2)}</span></div>` : ''}<div class="total-row"><span>${t.total}</span><span>EUR ${booking.total_price.toFixed(2)}</span></div></div>${paymentInfoSection}<div class="important-box"><h3>${t.importantInfo}</h3><p style="margin:0 0 15px;font-size:14px">${t.bringDocuments}</p><ul><li>${t.doc1}</li><li>${t.doc2}</li></ul></div></div><div class="footer"><p style="margin:0 0 15px;color:#D4AF37;font-size:16px;font-weight:bold">${t.questions}</p><p style="margin:5px 0"><a href="mailto:info@easyrentcars.rentals">info@easyrentcars.rentals</a></p><p style="margin:5px 0"><a href="tel:+436704070707">+43 670 40 70 707</a></p><div style="margin-top:20px;padding-top:20px;border-top:1px solid #333"><p style="margin:0;font-size:12px;color:#666">${t.footer}</p><p style="margin:5px 0 0;font-size:12px;color:#666">EasyRentCars | Alte Poststrasse 152, 8020 Graz, Austria</p></div></div></div></body></html>`;

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
            to: [booking.customer_email, BUSINESS_EMAIL],
            subject: t.subject,
            html: emailBody,
          }),
        });

        if (resendResponse.ok) {
          const result = await resendResponse.json();
          console.log('Email sent successfully via Resend:', result);
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
      console.log('RESEND_API_KEY not configured. Email would be sent to:', booking.customer_email, 'and', BUSINESS_EMAIL);
    }

    console.log(`Booking confirmation email prepared for ${booking.customer_email} and ${BUSINESS_EMAIL}. Sent: ${emailSent}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: emailSent
          ? 'Booking confirmation email sent successfully'
          : 'Email prepared (Resend API key not configured)',
        booking_id: booking.id,
        customer_email: booking.customer_email,
        email_sent: emailSent,
        error: emailError
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending booking confirmation:', error);
    const safeMessage = error.message === 'Missing required field: booking_id' || error.message === 'Booking not found'
      ? error.message
      : 'An error occurred while sending the booking confirmation';
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