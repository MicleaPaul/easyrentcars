/*
  # Update bookings RLS policy to include pending bookings

  1. Changes
    - Update policy to include 'pending' status bookings for availability checking
    - This ensures pending bookings also block vehicles from being double-booked
    
  2. Security
    - Maintains security while allowing proper availability checking
    - Users can only see basic booking info needed for availability
    
  3. Notes
    - Pending bookings should also count as unavailable to prevent overbooking
    - Works together with confirmed and active bookings
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Public can read active bookings for availability" ON bookings;

-- Recreate with pending status included
CREATE POLICY "Public can read active bookings for availability"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    booking_status IN ('confirmed', 'active', 'pending') 
    OR guest_link_token IS NOT NULL
  );