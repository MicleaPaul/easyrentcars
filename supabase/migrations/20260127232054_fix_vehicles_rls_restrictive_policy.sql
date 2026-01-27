/*
  # Fix Vehicles RLS - Remove RESTRICTIVE Policy Blocking

  ## Problem
  The "Admins can view all vehicles" policy is configured as RESTRICTIVE, which blocks
  ALL authenticated users (including non-admins) from viewing vehicles, even though
  the PERMISSIVE policy "Public can view available vehicles" should allow them access.
  
  ## Changes
  1. Drop the existing RESTRICTIVE admin policy
  2. Recreate it as PERMISSIVE policy
  
  ## Result
  - Anonymous users: Can view available vehicles (via "Public can view available vehicles")
  - Authenticated non-admins: Can view available vehicles (via "Public can view available vehicles")
  - Authenticated admins: Can view ALL vehicles including unavailable ones (via "Admins can view all vehicles")
  
  ## Security
  This change maintains proper security while fixing the overly restrictive access control.
*/

-- Drop the restrictive policy that was blocking access
DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;

-- Recreate as PERMISSIVE policy (OR logic, not AND logic)
CREATE POLICY "Admins can view all vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );
