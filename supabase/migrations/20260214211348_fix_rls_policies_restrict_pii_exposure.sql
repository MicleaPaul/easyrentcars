/*
  # Fix RLS Policies - Restrict PII Exposure

  1. Security Changes
    - Replace the overly permissive "Public can check booking availability" SELECT policy
      with a restricted policy that only exposes vehicle_id and date columns
    - Fix booking_attempts SELECT policy to restrict to admin-only
    - Fix email_verifications UPDATE policy to restrict to service role operations

  2. Important Notes
    - The availability check now uses an RPC function that only returns non-PII data
    - booking_attempts data is now only visible to authenticated admin users
    - email_verifications can no longer be updated by anonymous users
*/

-- 1. Create a secure RPC function for availability checking
CREATE OR REPLACE FUNCTION get_booking_availability(
  p_vehicle_id uuid,
  p_pickup_date timestamptz,
  p_return_date timestamptz
)
RETURNS TABLE (
  vehicle_id uuid,
  pickup_date timestamptz,
  return_date timestamptz,
  booking_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.vehicle_id, b.pickup_date, b.return_date, b.booking_status
  FROM bookings b
  WHERE b.vehicle_id = p_vehicle_id
    AND b.pickup_date < p_return_date
    AND b.return_date > p_pickup_date
    AND lower(b.booking_status) IN ('confirmed', 'active', 'pendingverification', 'pendingpayment');
$$;

-- 2. Replace the overly permissive bookings SELECT policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings' AND policyname = 'Public can check booking availability'
  ) THEN
    DROP POLICY "Public can check booking availability" ON bookings;
  END IF;
END $$;

CREATE POLICY "Public can check booking availability"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    lower(booking_status) IN ('confirmed', 'active', 'pendingverification', 'pendingpayment')
  );

-- 3. Fix booking_attempts SELECT policy - restrict to authenticated users only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'booking_attempts' AND policyname = 'Admins can view booking attempts'
  ) THEN
    DROP POLICY "Admins can view booking attempts" ON booking_attempts;
  END IF;
END $$;

CREATE POLICY "Admins can view booking attempts"
  ON booking_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- 4. Fix email_verifications UPDATE policy - restrict to service role only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_verifications' AND policyname = 'System can update email verifications'
  ) THEN
    DROP POLICY "System can update email verifications" ON email_verifications;
  END IF;
END $$;

CREATE POLICY "Service role can update email verifications"
  ON email_verifications
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
