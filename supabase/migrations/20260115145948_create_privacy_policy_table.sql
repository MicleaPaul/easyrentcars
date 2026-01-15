/*
  # Create Privacy Policy Table

  1. New Tables
    - `privacy_policy`
      - `id` (uuid, primary key) - Unique identifier
      - `section_key` (text, unique) - Unique key for each section (e.g., "data_collection")
      - `heading_de`, `heading_en`, `heading_fr`, `heading_it`, `heading_es`, `heading_ro` (text) - Section headings in 6 languages
      - `content_de`, `content_en`, `content_fr`, `content_it`, `content_es`, `content_ro` (jsonb) - Content as JSON array for each language
      - `display_order` (integer) - Order of display
      - `is_active` (boolean) - Visibility toggle
      - `created_at`, `updated_at` (timestamptz) - Timestamps

  2. Security
    - Enable RLS on `privacy_policy` table
    - Add policy for public read access to active privacy policy sections
    - Add policies for authenticated admin users to manage all operations

  3. Performance
    - Index on display_order for sorting
    - Index on is_active for filtering
    - Unique index on section_key

  4. Triggers
    - Auto-update updated_at timestamp on changes
*/

-- Create privacy_policy table
CREATE TABLE IF NOT EXISTS privacy_policy (
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
ALTER TABLE privacy_policy ENABLE ROW LEVEL SECURITY;

-- Public can view active privacy policy sections
CREATE POLICY "Public can view active privacy policy"
  ON privacy_policy FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins can view all privacy policy sections
CREATE POLICY "Admins can view all privacy policy"
  ON privacy_policy FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admins can insert privacy policy sections
CREATE POLICY "Admins can insert privacy policy"
  ON privacy_policy FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admins can update privacy policy sections
CREATE POLICY "Admins can update privacy policy"
  ON privacy_policy FOR UPDATE
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

-- Admins can delete privacy policy sections
CREATE POLICY "Admins can delete privacy policy"
  ON privacy_policy FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_privacy_display_order ON privacy_policy(display_order);
CREATE INDEX IF NOT EXISTS idx_privacy_is_active ON privacy_policy(is_active);
CREATE INDEX IF NOT EXISTS idx_privacy_section_key ON privacy_policy(section_key);

-- Add updated_at trigger
CREATE TRIGGER update_privacy_policy_updated_at
  BEFORE UPDATE ON privacy_policy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();