/*
  # Create Terms and Conditions Table

  1. New Tables
    - `terms_and_conditions`
      - `id` (uuid, primary key) - Unique identifier
      - `section_key` (text, unique) - Unique key for each section (e.g., "rental_rates")
      - `heading_de`, `heading_en`, `heading_fr`, `heading_it`, `heading_es`, `heading_ro` (text) - Section headings in 6 languages
      - `content_de`, `content_en`, `content_fr`, `content_it`, `content_es`, `content_ro` (jsonb) - Content as JSON array for each language
      - `display_order` (integer) - Order of display
      - `is_active` (boolean) - Visibility toggle
      - `created_at`, `updated_at` (timestamptz) - Timestamps

  2. Security
    - Enable RLS on `terms_and_conditions` table
    - Add policy for public read access to active terms
    - Add policies for authenticated admin users to manage all operations

  3. Performance
    - Index on display_order for sorting
    - Index on is_active for filtering
    - Unique index on section_key

  4. Triggers
    - Auto-update updated_at timestamp on changes
*/

-- Create terms_and_conditions table
CREATE TABLE IF NOT EXISTS terms_and_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  heading_de text NOT NULL DEFAULT '',
  heading_en text NOT NULL DEFAULT '',
  heading_fr text NOT NULL DEFAULT '',
  heading_it text NOT NULL DEFAULT '',
  heading_es text NOT NULL DEFAULT '',
  heading_ro text NOT NULL DEFAULT '',
  content_de jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_en jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_fr jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_it jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_es jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_ro jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE terms_and_conditions ENABLE ROW LEVEL SECURITY;

-- Public can view active terms
CREATE POLICY "Public can view active terms and conditions"
  ON terms_and_conditions FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins can view all terms
CREATE POLICY "Admins can view all terms and conditions"
  ON terms_and_conditions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admins can insert terms
CREATE POLICY "Admins can insert terms and conditions"
  ON terms_and_conditions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admins can update terms
CREATE POLICY "Admins can update terms and conditions"
  ON terms_and_conditions FOR UPDATE
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

-- Admins can delete terms
CREATE POLICY "Admins can delete terms and conditions"
  ON terms_and_conditions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_terms_display_order ON terms_and_conditions(display_order);
CREATE INDEX IF NOT EXISTS idx_terms_is_active ON terms_and_conditions(is_active);
CREATE INDEX IF NOT EXISTS idx_terms_section_key ON terms_and_conditions(section_key);

-- Add updated_at trigger
CREATE TRIGGER update_terms_and_conditions_updated_at 
  BEFORE UPDATE ON terms_and_conditions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
