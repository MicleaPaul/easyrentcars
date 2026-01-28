/*
  # Cleanup Duplicate Vehicle Blocks RLS Policies

  ## Problem
  The vehicle_blocks table has duplicate SELECT policies:
  - "Authenticated users can read active vehicle blocks" (authenticated, USING true)
  - "Authenticated users can view vehicle blocks" (authenticated, USING true)
  - "Public can read active vehicle blocks" (anon, USING true)
  
  These are redundant and can cause confusion.

  ## Solution
  1. Remove duplicate policies
  2. Keep one clear policy: "Public can check vehicle blocks"
  3. This policy allows both anonymous and authenticated users to read all blocks
  4. Keeps admin policy separate for management operations

  ## Changes
  - Drop 3 redundant policies
  - Create one unified policy for public availability checking

  ## Security Notes
  - Vehicle blocks contain no sensitive data (just vehicle_id and dates)
  - Public access is needed for availability checking in the booking flow
  - Admin policy remains for INSERT/UPDATE/DELETE operations
*/

-- Drop duplicate and redundant policies
DROP POLICY IF EXISTS "Authenticated users can read active vehicle blocks" ON vehicle_blocks;
DROP POLICY IF EXISTS "Authenticated users can view vehicle blocks" ON vehicle_blocks;
DROP POLICY IF EXISTS "Public can read active vehicle blocks" ON vehicle_blocks;

-- Create one clear policy for public access
CREATE POLICY "Public can check vehicle blocks"
  ON vehicle_blocks
  FOR SELECT
  TO anon, authenticated
  USING (true);
