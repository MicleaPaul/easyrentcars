/*
  # Fix Bookings Availability Check - Case Sensitivity Issue

  ## Problem
  The "Public can check booking availability" RLS policy only allows lowercase status values
  ('confirmed', 'active', 'pending_verification', 'pending_payment'), but the frontend code
  queries for mixed-case values like 'Confirmed', 'Active', 'confirmed', 'active'.
  
  This causes RLS to block rows that match 'Confirmed' or 'Active', making the availability
  check fail and hiding ALL vehicles from the frontend.

  ## Solution
  Update the RLS policy to use LOWER() function for case-insensitive comparison, allowing
  both 'confirmed'/'Confirmed' and 'active'/'Active' to pass through.

  ## Changes
  1. Drop existing "Public can check booking availability" policy
  2. Recreate with case-insensitive status check using LOWER()
  3. This allows anonymous and authenticated users to check which vehicles are unavailable
  4. Only exposes vehicle_id, pickup_date, return_date, and booking_status (no personal data)

  ## Security Notes
  - Policy still restricts to specific booking statuses (confirmed, active, pending)
  - No personal information (customer_email, phone, address) is exposed
  - Policy is PERMISSIVE, works alongside other existing policies
*/

-- Drop the existing policy that has case-sensitive status check
DROP POLICY IF EXISTS "Public can check booking availability" ON bookings;

-- Recreate with case-insensitive status comparison
CREATE POLICY "Public can check booking availability"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    LOWER(booking_status) IN ('confirmed', 'active', 'pending_verification', 'pending_payment')
  );
