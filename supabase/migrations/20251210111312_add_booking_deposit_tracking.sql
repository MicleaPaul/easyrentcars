/*
  # Add Deposit Tracking to Bookings

  1. New Columns
    - `deposit_amount` (numeric) - Amount paid as deposit (for cash payments)
    - `remaining_amount` (numeric) - Amount remaining to be paid at pickup
    - `paid_at` (timestamptz) - When the payment/deposit was completed
    - `deposit_paid_at` (timestamptz) - When the deposit was paid (for cash payments)
    - `stripe_payment_intent_id` (text) - Stripe payment intent ID

  2. Changes
    - Adds new columns for tracking partial payments (cash option with deposit)
    - Allows tracking of when payments were made
    - Supports both full card payments and deposit + cash at pickup payments

  3. Security
    - No RLS changes needed - existing policies apply

  4. Notes
    - For card payments: full amount is charged, deposit_amount and remaining_amount are NULL
    - For cash payments: deposit_amount = 1 day rental, remaining_amount = total - deposit
    - payment_status can be: 'pending', 'paid' (full), 'partial' (deposit only), 'failed'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'deposit_amount'
  ) THEN
    ALTER TABLE bookings ADD COLUMN deposit_amount numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'remaining_amount'
  ) THEN
    ALTER TABLE bookings ADD COLUMN remaining_amount numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN paid_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'deposit_paid_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN deposit_paid_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN stripe_payment_intent_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent ON bookings(stripe_payment_intent_id);
