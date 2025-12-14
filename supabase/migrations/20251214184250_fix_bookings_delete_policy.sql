/*
  # Fix Bookings DELETE Policy

  1. Changes
    - Drop and recreate DELETE policy for bookings table
    - Ensure admins can delete bookings with explicit RLS policy

  2. Security
    - Only authenticated admin users can delete bookings
    - Uses admin_users table to verify admin status
*/

-- Drop existing DELETE policy if exists
DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;

-- Recreate policy with explicit admin check
CREATE POLICY "Admins can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
