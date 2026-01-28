# Booking Flow Testing Guide - EasyRentCars

**Status**: ✅ LIVE & CONFIGURED
**Last Updated**: January 27, 2026
**Environment**: Production (https://easyrentcars.rentals)

---

## 🎯 Purpose

This guide will help you verify that the complete booking flow with Stripe payment integration is working correctly in the live environment.

---

## ✅ Pre-Verification Checklist

### Environment Variables (Configured)

**Frontend (.env):**
- ✅ VITE_SUPABASE_URL: `https://tshrwmvndggfwhympjeg.supabase.co`
- ✅ VITE_SUPABASE_ANON_KEY: Configured
- ✅ SITE_URL: `https://easyrentcars.rentals`

**Supabase Edge Functions (Required Secrets):**
- ⚠️ STRIPE_SECRET_KEY: Must be configured in Supabase Dashboard
- ⚠️ STRIPE_WEBHOOK_SECRET: Must be configured in Supabase Dashboard
- ⚠️ GMAIL_APP_PASSWORD: Must be configured for email sending
- ✅ SUPABASE_URL: Auto-configured
- ✅ SUPABASE_SERVICE_ROLE_KEY: Auto-configured

### Database Tables (Verified)

- ✅ `bookings` table with all required columns
- ✅ `vehicles` table with RLS enabled
- ✅ `checkout_holds` table for preventing double bookings
- ✅ `vehicle_blocks` table for manual reservations
- ✅ All RLS policies properly configured

### Edge Functions (Deployed & Active)

- ✅ `create-booking-checkout` - Creates Stripe session and checkout hold
- ✅ `stripe-webhook` - Processes payment completion
- ✅ `send-booking-confirmation` - Sends email confirmations
- ✅ `generate-booking-pdf` - Creates PDF confirmation
- ✅ All functions have proper CORS configuration

---

## 📋 Complete Testing Checklist

### 1️⃣ Test Stripe Full Payment (Card Payment)

**Steps:**
1. Navigate to https://easyrentcars.rentals
2. Select a vehicle from the fleet
3. Choose pickup and return dates (at least 1 day apart)
4. Click "Book Now" or "Reserve"
5. Fill in customer information:
   - Name: Your Name
   - Email: your-test-email@example.com
   - Phone: +43 XXX XXX XXXX
   - Age: 25 or higher
6. **Select Payment Method: "Stripe" (Pay Full Amount Now)**
7. Click "Proceed to Payment"

**Expected Results:**
- ✅ Redirected to Stripe Checkout page
- ✅ See full rental amount in Stripe (rental + cleaning + location fees)
- ✅ Complete payment using test card: `4242 4242 4242 4242`
  - Expiry: Any future date (e.g., 12/34)
  - CVC: Any 3 digits (e.g., 123)
- ✅ Automatically redirected back to site after 2-5 seconds
- ✅ Landing on `/booking-success?session_id=cs_test_...`
- ✅ Loading indicator appears while waiting for webhook
- ✅ After 2-4 seconds, see "Booking Confirmed" message with green checkmark
- ✅ All booking details displayed correctly
- ✅ Payment status shows "Paid"
- ✅ Option to download PDF visible
- ✅ Email received within 1 minute at provided email address
- ✅ Email shows full payment completed online

**Database Verification:**
```sql
-- Check latest booking
SELECT id, customer_email, booking_status, payment_status, payment_method,
       total_price, deposit_amount, remaining_amount, stripe_session_id
FROM bookings
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Values:**
- `booking_status` = "Confirmed"
- `payment_status` = "paid"
- `payment_method` = "stripe"
- `deposit_amount` = NULL
- `remaining_amount` = NULL
- `stripe_session_id` = "cs_test_..."

---

### 2️⃣ Test Cash Payment with Deposit

**Steps:**
1. Navigate to https://easyrentcars.rentals
2. Select a different vehicle
3. Choose pickup and return dates
4. Fill in customer information
5. **Select Payment Method: "Cash" (Pay Deposit Online, Rest at Pickup)**
6. Click "Proceed to Payment"

**Expected Results:**
- ✅ Redirected to Stripe Checkout
- ✅ See ONLY 1-day rental price (deposit amount)
- ✅ Description mentions "remaining EUR XX.XX due at pickup"
- ✅ Complete payment using test card
- ✅ Automatically redirected to success page
- ✅ See "Booking Confirmed" message
- ✅ Payment section shows:
  - "Deposit Paid Online: EUR XX.XX"
  - "Remaining Due at Pickup (CASH): EUR XX.XX"
- ✅ Email received showing deposit and remaining amount clearly

**Database Verification:**
```sql
SELECT id, customer_email, payment_status, payment_method,
       total_price, deposit_amount, remaining_amount
FROM bookings
WHERE payment_method = 'cash'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Values:**
- `payment_status` = "partial"
- `payment_method` = "cash"
- `deposit_amount` = (price_per_day of vehicle)
- `remaining_amount` = (total_price - deposit_amount)

---

### 3️⃣ Test Checkout Hold Mechanism

**Purpose:** Verify that vehicles are temporarily locked during checkout to prevent double bookings.

**Steps:**
1. Open browser window A and start booking for Vehicle X (dates: Jan 30 - Feb 2)
2. Proceed to Stripe checkout page but DO NOT complete payment
3. Open browser window B (incognito/private mode)
4. Try to book the SAME vehicle X for OVERLAPPING dates (Jan 31 - Feb 3)

**Expected Results:**
- ✅ Window A: Checkout hold created in database
- ✅ Window B: Should see error message "Vehicle is currently being booked by another customer. Please try again in a few minutes or choose different dates."
- ✅ After 30 minutes, if Window A doesn't complete payment, hold expires
- ✅ Window B can now book the vehicle

**Database Verification:**
```sql
SELECT * FROM checkout_holds
WHERE status = 'active'
ORDER BY created_at DESC;
```

---

### 4️⃣ Test Email Confirmation System

**Components to Verify:**

✅ **Customer Email:**
- Received within 30-60 seconds after payment
- Contains booking ID
- Shows vehicle details (brand, model, year, transmission)
- Shows pickup/return dates, times, and locations
- Shows price breakdown (rental, cleaning, location fees, total)
- For cash payment: clearly shows deposit paid + remaining due
- For card payment: shows full payment completed
- Includes required documents list
- Contact information visible
- Professional formatting with EasyRentCars branding

✅ **Business Email (easyrentgraz@gmail.com):**
- Copy of customer email received
- Same information as customer email

**Manual Check:**
1. Check inbox of email provided during booking
2. Verify all sections are present and correct
3. Check language matches the one selected during booking (German, English, Romanian, etc.)

---

### 5️⃣ Test Webhook Processing

**What Happens:**
1. Customer completes payment on Stripe
2. Stripe sends webhook event to: `https://tshrwmvndggfwhympjeg.supabase.co/functions/v1/stripe-webhook`
3. Webhook handler:
   - Verifies signature using STRIPE_WEBHOOK_SECRET
   - Checks for existing booking (prevents duplicates)
   - Validates vehicle availability
   - Creates booking in database
   - Updates checkout hold status to "converted"
   - Triggers email confirmation

**Verification:**
1. Go to Supabase Dashboard → Edge Functions → stripe-webhook → Logs
2. Look for recent execution logs
3. Check for successful processing:

```
Processing event: checkout.session.completed
============================================
BOOKING CREATED - PAYMENT SUCCESSFUL
============================================
Booking ID: abc123...
Customer: John Doe
Email: john@example.com
Vehicle: BMW 320d
Pickup: 2026-01-30T10:00:00Z
Return: 2026-02-02T10:00:00Z
Payment Type: full
Amount Paid: EUR125.00
============================================
Confirmation email sent successfully
```

**Check for Errors:**
- ❌ "Webhook signature verification failed" → STRIPE_WEBHOOK_SECRET incorrect
- ❌ "Vehicle no longer available" → Double booking prevented, refund initiated
- ❌ "Error creating booking" → Database error, refund initiated
- ❌ "Failed to send confirmation email" → GMAIL_APP_PASSWORD issue

---

### 6️⃣ Test Success Page Retry Logic

**Purpose:** Verify the success page correctly waits for webhook to complete.

**Steps:**
1. Complete a booking and payment
2. Observe the `/booking-success?session_id=...` page

**Expected Behavior:**
- ✅ Page loads with loading spinner
- ✅ Automatically retries fetching booking every 2 seconds
- ✅ Maximum 10 retries (20 seconds total)
- ✅ Once booking appears in database, shows success message
- ✅ If booking not found after 10 retries, shows message: "Booking is still being processed. Please check your email for confirmation."

**Technical Details:**
- `BookingSuccessPage.tsx` implements retry logic
- Fetches booking by `stripe_session_id`
- Uses `useEffect` with retry counter
- Gives webhook enough time to process (20 seconds max)

---

### 7️⃣ Test Edge Cases

#### A. Expired Stripe Session
**Steps:**
1. Start checkout process
2. Stay on Stripe page for 30+ minutes
3. Try to complete payment

**Expected:**
- ✅ Stripe shows "Session expired" error
- ✅ Checkout hold in database gets status "expired"
- ✅ Vehicle becomes available again

#### B. Payment Failure
**Steps:**
1. Start checkout
2. Use failing test card: `4000 0000 0000 0002`

**Expected:**
- ✅ Stripe shows payment error
- ✅ No booking created
- ✅ Checkout hold expires after 30 min
- ✅ Can retry with different card

#### C. Double Booking Prevention
**Covered in Test 3️⃣ above**

#### D. Stripe Cancel/Back Button
**Steps:**
1. Start checkout
2. Click "Back" or close Stripe tab

**Expected:**
- ✅ Redirected to cancel_url (booking page)
- ✅ Can restart booking process
- ✅ Checkout hold expires after 30 min

---

## 🔍 Monitoring & Logs

### Supabase Edge Functions Logs

**Check Logs:**
1. Go to: https://supabase.com/dashboard/project/tshrwmvndggfwhympjeg/functions
2. Select function from list
3. Click "Logs" tab
4. Filter by date/time

**Key Functions to Monitor:**

1. **create-booking-checkout**
   - Should see: "Checkout session created"
   - Check for: Vehicle validation, hold creation
   - Common errors: "Vehicle not found", "Vehicle no longer available"

2. **stripe-webhook**
   - Should see: "Processing event: checkout.session.completed"
   - Check for: Booking creation success, email trigger
   - Common errors: Signature verification, duplicate booking

3. **send-booking-confirmation**
   - Should see: "Email sent successfully via Gmail SMTP"
   - Check for: SMTP connection, email delivery
   - Common errors: "GMAIL_APP_PASSWORD not configured"

### Database Queries for Monitoring

**Recent Bookings:**
```sql
SELECT id, customer_name, customer_email, booking_status, payment_status,
       payment_method, total_price, created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;
```

**Active Checkout Holds:**
```sql
SELECT id, vehicle_id, customer_email, expires_at, status
FROM checkout_holds
WHERE status = 'active'
ORDER BY created_at DESC;
```

**Failed/Expired Holds:**
```sql
SELECT id, vehicle_id, customer_email, status, created_at
FROM checkout_holds
WHERE status IN ('expired', 'cancelled')
ORDER BY created_at DESC
LIMIT 10;
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Webhook signature verification failed"
**Cause:** STRIPE_WEBHOOK_SECRET not configured or incorrect
**Solution:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Find webhook endpoint
3. Click "Reveal" on signing secret
4. Copy value
5. Add to Supabase: Project Settings → Edge Functions → Secrets
6. Redeploy stripe-webhook function

### Issue 2: Email not received
**Cause:** GMAIL_APP_PASSWORD not configured
**Solution:**
1. Create Google App Password for easyrentgraz@gmail.com
2. Add to Supabase secrets as GMAIL_APP_PASSWORD
3. Redeploy send-booking-confirmation function

### Issue 3: Booking not appearing on success page
**Cause:** Webhook processing delay or failure
**Solution:**
1. Check stripe-webhook logs in Supabase
2. Verify webhook is receiving events from Stripe
3. Check for errors in logs
4. Success page has 20-second retry logic built-in

### Issue 4: Double booking despite holds
**Cause:** Expired holds or race condition
**Solution:**
1. Verify cleanup_expired_holds function runs
2. Check hold expiration times (30 min + 5 min buffer)
3. Review checkout_holds table for status
4. Test with concurrent requests

---

## 🚀 Production Readiness Checklist

Before going fully live, verify:

- [ ] STRIPE_SECRET_KEY (live mode) configured in Supabase
- [ ] STRIPE_WEBHOOK_SECRET (live mode) configured
- [ ] Stripe webhook endpoint points to production Edge Function
- [ ] GMAIL_APP_PASSWORD configured and working
- [ ] Test at least 3 successful bookings end-to-end
- [ ] Verify emails arrive within 1 minute
- [ ] Test both payment methods (Stripe full + Cash deposit)
- [ ] Verify PDF download works
- [ ] Check Stripe Dashboard for successful payments
- [ ] Verify booking appears in admin dashboard
- [ ] Test from mobile device (responsive design)
- [ ] Test with different browsers (Chrome, Safari, Firefox)

---

## 📊 Success Criteria

**The booking flow is considered fully functional when:**

✅ Customer completes payment on Stripe
✅ Automatically redirected to success page within 5 seconds
✅ Success page shows booking details within 20 seconds
✅ Email confirmation arrives within 1 minute
✅ Booking appears in database with status "Confirmed"
✅ Payment recorded correctly (full or partial)
✅ No double bookings occur
✅ PDF download works
✅ Process works for both payment methods

---

## 📞 Support

If you encounter any issues during testing:

1. Check Supabase Edge Function logs
2. Verify all secrets are configured
3. Check Stripe Dashboard for webhook delivery
4. Review database for data integrity
5. Test in incognito mode to rule out browser cache issues

---

**Testing Complete!** 🎉

Once all tests pass, the booking system is ready for production use.
