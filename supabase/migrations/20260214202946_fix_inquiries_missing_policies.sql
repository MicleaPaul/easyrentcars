/*
  # Fix inquiries table - add missing policies and indexes

  1. Changes
    - Add missing INSERT policy for anon users
    - Add missing DELETE policy for admins
    - Add performance indexes

  2. Notes
    - The inquiries table already exists with some policies
    - This migration adds the missing pieces
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'inquiries' AND policyname = 'Anyone can submit inquiries'
  ) THEN
    CREATE POLICY "Anyone can submit inquiries"
      ON inquiries
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'inquiries' AND policyname = 'Admins can delete inquiries'
  ) THEN
    CREATE POLICY "Admins can delete inquiries"
      ON inquiries
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admin_users
          WHERE admin_users.id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email_sent ON inquiries (email_sent) WHERE email_sent = false;
