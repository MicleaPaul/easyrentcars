/*
  # Create Checkout Holds Table for Race Condition Prevention

  1. Purpose
    - Prevents double bookings during the Stripe checkout process
    - Creates a temporary "hold" on a vehicle while a customer is completing payment
    - Holds automatically expire after 35 minutes (slightly longer than Stripe session timeout)

  2. New Tables
    - `checkout_holds`
      - `id` (uuid, primary key) - Unique identifier for the hold
      - `vehicle_id` (uuid, foreign key) - Reference to the vehicle being held
      - `stripe_session_id` (text) - The Stripe checkout session ID
      - `pickup_date` (date) - Start date of the rental
      - `return_date` (date) - End date of the rental
      - `customer_email` (text) - Customer email for reference
      - `expires_at` (timestamptz) - When this hold expires
      - `created_at` (timestamptz) - When the hold was created
      - `status` (text) - 'active', 'converted', 'expired', 'cancelled'

  3. Security
    - Enable RLS on the table
    - No public access policies (only service role can manage holds)

  4. Indexes
    - Index on vehicle_id and dates for quick conflict checks
    - Index on expires_at for cleanup jobs
    - Index on stripe_session_id for webhook lookups
*/

CREATE TABLE IF NOT EXISTS checkout_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL UNIQUE,
  pickup_date date NOT NULL,
  return_date date NOT NULL,
  customer_email text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'expired', 'cancelled'))
);

ALTER TABLE checkout_holds ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_checkout_holds_vehicle_dates 
ON checkout_holds(vehicle_id, pickup_date, return_date) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_checkout_holds_expires_at 
ON checkout_holds(expires_at) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_checkout_holds_stripe_session 
ON checkout_holds(stripe_session_id);

CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE checkout_holds 
  SET status = 'expired' 
  WHERE status = 'active' 
  AND expires_at < now();
END;
$$;

COMMENT ON TABLE checkout_holds IS 'Temporary holds on vehicles during Stripe checkout to prevent double bookings';
COMMENT ON FUNCTION public.cleanup_expired_holds IS 'Marks expired checkout holds as expired';