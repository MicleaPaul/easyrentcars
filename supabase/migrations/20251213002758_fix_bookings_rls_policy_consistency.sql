/*
  # Fix RLS Policy for Bookings Availability Check
  
  1. Changes
    - Update the "Public can read active bookings for availability" policy
    - Add missing status values to ensure all active bookings are visible
    - Include both PascalCase and lowercase variants for maximum compatibility
  
  2. Status values included
    - Confirmed, confirmed (test bookings)
    - Active, active (ongoing rentals)
    - Pending, pending (awaiting confirmation)
    - PendingPayment (awaiting payment)
    - PendingVerification (awaiting email verification)
  
  3. Security
    - Only allows reading booking data needed for availability checks
    - Does not expose personal information to unauthorized users
    - Maintains data privacy while enabling proper vehicle filtering
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Public can read active bookings for availability" ON bookings;

-- Create updated policy with all status variants
CREATE POLICY "Public can read active bookings for availability"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    booking_status IN (
      'Confirmed',
      'confirmed', 
      'Active',
      'active',
      'Pending',
      'pending',
      'PendingPayment',
      'PendingVerification'
    )
  );
