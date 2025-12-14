/*
  # Recreate FAQs Table with Complete Structure

  ## Problem
  The faqs table was accidentally deleted or doesn't exist in the database.

  ## Solution
  Create complete faqs table with:
  - All 6 language columns (DE, EN, FR, IT, ES, RO)
  - Metadata fields (is_popular, display_order, is_hidden)
  - Timestamps (created_at, updated_at)
  - Complete RLS policies for public read and admin management

  ## Security
  - RLS enabled
  - Public can read non-hidden FAQs
  - Only admins can create, update, delete FAQs
*/

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_de text NOT NULL,
  answer_de text NOT NULL,
  question_en text NOT NULL,
  answer_en text NOT NULL,
  question_fr text NOT NULL,
  answer_fr text NOT NULL,
  question_it text NOT NULL,
  answer_it text NOT NULL,
  question_es text NOT NULL,
  answer_es text NOT NULL,
  question_ro text NOT NULL DEFAULT '',
  answer_ro text NOT NULL DEFAULT '',
  is_popular boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_is_hidden ON faqs(is_hidden);

-- Create updated_at trigger
CREATE TRIGGER update_faqs_updated_at 
  BEFORE UPDATE ON faqs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES

-- PUBLIC SELECT: Anyone can view non-hidden FAQs
CREATE POLICY "Public can view visible FAQs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (is_hidden = false);

-- ADMIN SELECT: Admins can view all FAQs (including hidden)
CREATE POLICY "Admins can view all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- ADMIN INSERT: Admins can create new FAQs
CREATE POLICY "Admins can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- ADMIN UPDATE: Admins can update FAQs
CREATE POLICY "Admins can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- ADMIN DELETE: Admins can delete FAQs
CREATE POLICY "Admins can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
