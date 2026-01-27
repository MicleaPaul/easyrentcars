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
    const { booking_id, customer_email, guest_token } = await req.json();

    if (!booking_id) {
      throw new Error('Missing required field: booking_id');
    }

    // First fetch the booking to verify access
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

    // Verify authorization - must be customer or admin
    const authHeader = req.headers.get('Authorization');
    let isAuthorized = false;

    if (authHeader) {
      // Check if user is authenticated and is either admin or booking owner
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (!authError && user) {
        // Check if admin
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single();

        // User is authorized if they are admin OR if their email matches booking
        isAuthorized = !!adminUser || user.email === booking.customer_email;
      }
    }

    // Also allow access via guest_link_token for non-authenticated users
    if (!isAuthorized && guest_token && booking.guest_link_token) {
      isAuthorized = guest_token === booking.guest_link_token;
    }

    // Also allow access if customer_email matches (for backward compatibility)
    if (!isAuthorized && customer_email) {
      isAuthorized = customer_email === booking.customer_email;
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to booking' }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const vehicle = booking.vehicles;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-AT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('de-AT', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const days = booking.rental_days || 1;
    const rentalCost = booking.rental_cost || 0;
    const locationFees = (booking.pickup_fee || 0) + (booking.return_fee || 0);
    const depositAmount = booking.deposit_amount || 0;
    const remainingAmount = booking.remaining_amount || 0;
    const isCashPayment = booking.payment_method === 'cash' && depositAmount > 0;

    const pdfHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:20mm}body{font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#333;margin:0;padding:20px}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #D4AF37;padding-bottom:20px;margin-bottom:20px}.logo{font-size:28px;font-weight:bold;color:#0B0C0F}.logo span{color:#D4AF37}.company-info{text-align:right;font-size:10px;color:#666}.title{font-size:24px;font-weight:bold;color:#0B0C0F;text-align:center;margin:20px 0;padding:15px;background:#f5f5f5;border-left:4px solid #D4AF37}.booking-id{text-align:center;margin-bottom:30px}.booking-id-label{font-size:12px;color:#666}.booking-id-value{font-size:20px;font-weight:bold;font-family:monospace;color:#D4AF37;background:#0B0C0F;padding:10px 20px;display:inline-block;border-radius:4px}.section{margin-bottom:25px}.section-title{font-size:14px;font-weight:bold;color:#0B0C0F;border-bottom:2px solid #D4AF37;padding-bottom:5px;margin-bottom:15px;text-transform:uppercase}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.info-box{background:#f9f9f9;padding:15px;border-radius:4px;border-left:3px solid #D4AF37}.info-box-title{font-size:10px;color:#666;text-transform:uppercase;margin-bottom:5px}.info-box-value{font-size:14px;font-weight:bold;color:#333}.info-box-sub{font-size:11px;color:#666;margin-top:3px}.vehicle-box{background:#0B0C0F;color:white;padding:20px;border-radius:4px;margin-bottom:20px}.vehicle-name{font-size:20px;font-weight:bold;color:#D4AF37}.vehicle-details{font-size:12px;color:#ccc;margin-top:5px}.price-table{width:100%;border-collapse:collapse;margin-bottom:20px}.price-table td{padding:10px;border-bottom:1px solid #eee}.price-table .label{color:#666}.price-table .value{text-align:right;font-weight:bold}.price-table .total{font-size:16px;color:#D4AF37;border-top:2px solid #D4AF37;border-bottom:none}.deposit-box{background:#FFF8E1;border:1px solid #FFE082;padding:15px;border-radius:4px;margin-top:15px}.deposit-row{display:flex;justify-content:space-between;margin-bottom:5px}.signature-section{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:40px}.signature-box{border-top:1px solid #333;padding-top:10px;margin-top:60px}.signature-label{font-size:10px;color:#666}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;font-size:10px;color:#666}.terms{font-size:9px;color:#666;background:#f5f5f5;padding:10px;border-radius:4px;margin-top:20px}</style></head><body><div class="header"><div class="logo">Easy<span>Rent</span>Cars</div><div class="company-info">EasyRentCars<br>Alte Poststrasse 152<br>8020 Graz, Austria<br>Tel: +43 670 40 70 707<br>info@easyrentcars.rentals</div></div><div class="title">Booking Confirmation</div><div class="booking-id"><div class="booking-id-label">Booking ID</div><div class="booking-id-value">${booking.id.slice(0, 8).toUpperCase()}</div></div><div class="vehicle-box"><div class="vehicle-name">${vehicle.brand} ${vehicle.model}</div><div class="vehicle-details">${vehicle.year} | ${vehicle.transmission} | ${vehicle.fuel_type} | ${vehicle.seats} Seats</div></div><div class="info-grid"><div class="section"><div class="section-title">Pickup</div><div class="info-box"><div class="info-box-title">Date</div><div class="info-box-value">${formatDate(booking.pickup_date)}</div><div class="info-box-sub">${formatTime(booking.pickup_date)}</div></div><div class="info-box" style="margin-top:10px"><div class="info-box-title">Location</div><div class="info-box-value">${booking.pickup_location}</div>${booking.pickup_location_address ? `<div class="info-box-sub" style="color:#D4AF37;font-style:italic">${booking.pickup_location_address}</div>` : ''}</div></div><div class="section"><div class="section-title">Return</div><div class="info-box"><div class="info-box-title">Date</div><div class="info-box-value">${formatDate(booking.return_date)}</div><div class="info-box-sub">${formatTime(booking.return_date)}</div></div><div class="info-box" style="margin-top:10px"><div class="info-box-title">Location</div><div class="info-box-value">${booking.return_location}</div>${booking.return_location_address ? `<div class="info-box-sub" style="color:#D4AF37;font-style:italic">${booking.return_location_address}</div>` : ''}</div></div></div><div class="section"><div class="section-title">Customer Information</div><div class="info-grid"><div class="info-box"><div class="info-box-title">Name</div><div class="info-box-value">${booking.customer_name}</div></div><div class="info-box"><div class="info-box-title">Email</div><div class="info-box-value">${booking.customer_email}</div></div><div class="info-box"><div class="info-box-title">Phone</div><div class="info-box-value">${booking.customer_phone}</div></div><div class="info-box"><div class="info-box-title">Payment Method</div><div class="info-box-value">${booking.payment_method === 'stripe' ? 'Credit Card' : 'Cash'}</div></div></div></div><div class="section"><div class="section-title">Price Breakdown</div><table class="price-table"><tr><td class="label">Rental (${days} days x EUR ${vehicle.price_per_day})</td><td class="value">EUR ${rentalCost.toFixed(2)}</td></tr><tr><td class="label">Cleaning Fee</td><td class="value">EUR ${(booking.cleaning_fee || 7).toFixed(2)}</td></tr>${locationFees > 0 ? `<tr><td class="label">Location Fees</td><td class="value">EUR ${locationFees.toFixed(2)}</td></tr>` : ''}${(booking.after_hours_fee || 0) > 0 ? `<tr><td class="label">After Hours Fee</td><td class="value">EUR ${booking.after_hours_fee.toFixed(2)}</td></tr>` : ''}<tr class="total"><td class="label">Total</td><td class="value">EUR ${booking.total_price.toFixed(2)}</td></tr></table>${isCashPayment ? `<div class="deposit-box"><div class="deposit-row"><span>Deposit Paid Online</span><span style="color:#2E7D32;font-weight:bold">EUR ${depositAmount.toFixed(2)}</span></div><div class="deposit-row" style="font-weight:bold"><span>Remaining Due (Cash at Pickup)</span><span style="color:#F57C00">EUR ${remainingAmount.toFixed(2)}</span></div></div>` : ''}</div><div class="terms"><strong>Terms & Conditions:</strong> By accepting this booking, you agree to our rental terms and conditions.</div><div class="signature-section"><div><div class="signature-box"><div class="signature-label">Customer Signature</div></div></div><div><div class="signature-box"><div class="signature-label">Company Signature</div></div></div></div><div class="footer"><p style="font-size:12px;color:#D4AF37;margin-bottom:10px">Thank you for choosing EasyRentCars!</p><p>EasyRentCars | Alte Poststrasse 152, 8020 Graz, Austria</p><p>Tel: +43 670 40 70 707 | Email: info@easyrentcars.rentals</p></div></body></html>`;

    return new Response(pdfHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="booking-${booking.id.slice(0, 8)}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating booking PDF:', error);
    const safeMessage = error.message === 'Booking not found' || error.message === 'Missing required field: booking_id'
      ? error.message
      : 'An error occurred while generating the booking document';
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