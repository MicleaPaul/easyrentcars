/*
  # Fix FAQs RLS Policies for Public Access

  ## Problem Identified
  The "Admins can view all FAQs" policy is RESTRICTIVE, which blocks public access
  even though there's a PERMISSIVE policy for public users. This causes redirect to login.

  ## Solution
  1. Drop the problematic RESTRICTIVE policy
  2. Recreate it as PERMISSIVE so it doesn't block public access
  3. Ensure public users can read non-hidden FAQs without authentication
  4. Ensure admins can read all FAQs including hidden ones

  ## Changes
  - Drop "Admins can view all FAQs" RESTRICTIVE policy
  - Recreate "Admins can view all FAQs" as PERMISSIVE policy
  - Keep "Public can view visible FAQs" policy unchanged

  ## Security
  - Public (anon + authenticated) can read FAQs where is_hidden = false
  - Authenticated admins can read all FAQs (including hidden ones)
  - Only admins can insert, update, or delete FAQs
*/

-- Drop the problematic RESTRICTIVE policy
DROP POLICY IF EXISTS "Admins can view all FAQs" ON faqs;

-- Recreate as PERMISSIVE policy so it doesn't block public access
CREATE POLICY "Admins can view all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Verify public policy exists (should already be there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'faqs' 
    AND policyname = 'Public can view visible FAQs'
  ) THEN
    CREATE POLICY "Public can view visible FAQs"
      ON faqs FOR SELECT
      TO anon, authenticated
      USING (is_hidden = false);
  END IF;
END $$;
