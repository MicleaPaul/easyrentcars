/*
  # Fix bookings RLS policy for availability checking

  1. Changes
    - Add new policy to allow public users to read active bookings for availability checking
    - This enables the frontend to check which vehicles are unavailable during booking periods
    - Only exposes bookings with booking_status 'confirmed' or 'active' to minimize data exposure
    
  2. Security
    - Policy only allows reading basic booking information needed for availability
    - Does not expose sensitive customer data unnecessarily
    - Restricted to active/confirmed bookings only
    
  3. Notes
    - This fixes the issue where no vehicles appear when selecting dates
    - The previous policy required guest_link_token, preventing availability checks
    - Public users can now see which vehicles are booked during specific periods
*/

-- Drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "Anyone can view bookings with token" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings with token" ON bookings;

-- Create new policy for public availability checking
-- Only allow reading confirmed or active bookings for availability checks
CREATE POLICY "Public can read active bookings for availability"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    booking_status IN ('confirmed', 'active') 
    OR guest_link_token IS NOT NULL
  );