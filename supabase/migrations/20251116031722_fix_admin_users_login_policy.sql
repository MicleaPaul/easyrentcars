/*
  # Fix Admin Users Login Policy

  1. Changes
    - Drop existing restrictive SELECT policy on admin_users
    - Create new policy allowing authenticated users to view their own admin record
    - This fixes the circular dependency where users couldn't check if they're admins

  2. Security
    - Users can only see their own admin record (WHERE id = auth.uid())
    - Still maintains security by restricting to authenticated users only
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create new policy allowing users to check their own admin status
CREATE POLICY "Users can view own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
