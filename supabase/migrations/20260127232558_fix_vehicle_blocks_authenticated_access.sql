/*
  # Fix vehicle_blocks RLS for authenticated users

  This migration fixes the issue where authenticated (non-admin) users cannot view vehicle blocks,
  which prevents the availability checker from working properly.

  ## Changes
  
  1. Add PERMISSIVE SELECT policy for authenticated users to read vehicle_blocks
     - Allows authenticated users to check vehicle availability
     - Does not grant access to modify blocks (INSERT/UPDATE/DELETE remain admin-only)
  
  ## Security
  
  - READ access is safe for authenticated users - they only see which vehicles are blocked
  - WRITE operations remain restricted to admin users only
  - Policy is PERMISSIVE to work alongside existing policies
*/

-- Add policy for authenticated users to read vehicle blocks
CREATE POLICY "Authenticated users can view vehicle blocks"
  ON vehicle_blocks
  FOR SELECT
  TO authenticated
  USING (true);
