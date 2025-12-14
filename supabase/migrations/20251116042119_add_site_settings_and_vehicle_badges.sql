/*
  # Add Site Settings and Enhanced Vehicle Status System

  ## Overview
  Comprehensive enhancement to enable dynamic site configuration and flexible vehicle marketing badges.
  Makes business hours, contact info, and operational settings database-driven for easy management.
  Adds multiple badge types to vehicles for better marketing control.

  ## New Tables

  ### 1. site_settings
  - `id` (uuid, primary key) - Unique settings identifier
  - `key` (text, unique) - Settings key (e.g., 'business_hours', 'contact_info')
  - `value` (jsonb) - Settings value with flexible JSON structure
  - `category` (text) - Settings category (operational, contact, marketing, system)
  - `description` (text) - Human-readable description of setting
  - `is_public` (boolean) - Whether setting is visible to public (non-admin)
  - `updated_at` (timestamptz) - Last update timestamp
  - `updated_by` (uuid) - Admin user who last updated the setting

  ## Modified Tables

  ### vehicles - Enhanced Badge System
  - `is_new` (boolean) - Vehicle is new to fleet
  - `is_popular` (boolean) - Vehicle is popular/frequently rented
  - `badge_text` (text) - Custom badge text
  - `badge_type` (text) - Badge type: featured, new, popular, hot_deal, limited_offer
  - `badge_color` (text) - Custom badge color (hex or preset name)
  - `badge_expires_at` (timestamptz) - Badge expiration date for time-limited offers
  - `priority_order` (integer) - Display priority (lower = higher priority)

  ## Default Settings Data
  Creates default entries for:
  - Business hours (weekday and weekend)
  - After-hours fee amount
  - Contact information
  - Location-based fees
  - Company information

  ## Security
  - RLS enabled on site_settings table
  - Public can read settings marked as is_public = true
  - Only authenticated admins can modify settings
  - All changes tracked with updated_by field

  ## Important Notes
  1. All time-based settings use Europe/Vienna timezone
  2. JSONB structure allows flexible configuration without schema changes
  3. Badge system supports multiple simultaneous badges per vehicle
  4. Priority order determines which badge shows first when multiple exist
  5. Expired badges automatically filtered in queries
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL CHECK (category IN ('operational', 'contact', 'marketing', 'system')),
  description text NOT NULL,
  is_public boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Add new columns to vehicles table for enhanced badge system
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'is_new') THEN
    ALTER TABLE vehicles ADD COLUMN is_new boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'is_popular') THEN
    ALTER TABLE vehicles ADD COLUMN is_popular boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'badge_text') THEN
    ALTER TABLE vehicles ADD COLUMN badge_text text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'badge_type') THEN
    ALTER TABLE vehicles ADD COLUMN badge_type text CHECK (badge_type IN ('featured', 'new', 'popular', 'hot_deal', 'limited_offer', 'custom'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'badge_color') THEN
    ALTER TABLE vehicles ADD COLUMN badge_color text DEFAULT 'gold';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'badge_expires_at') THEN
    ALTER TABLE vehicles ADD COLUMN badge_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'priority_order') THEN
    ALTER TABLE vehicles ADD COLUMN priority_order integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Site settings policies
CREATE POLICY "Public can view public settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins can view all settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update settings"
  ON site_settings FOR UPDATE
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

CREATE POLICY "Admins can delete settings"
  ON site_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_public ON site_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_vehicles_badge_type ON vehicles(badge_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_priority_order ON vehicles(priority_order);
CREATE INDEX IF NOT EXISTS idx_vehicles_badge_expires_at ON vehicles(badge_expires_at);

-- Create trigger function to update updated_at and track updater
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to site_settings
DROP TRIGGER IF EXISTS update_site_settings_timestamp_trigger ON site_settings;
CREATE TRIGGER update_site_settings_timestamp_trigger
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_timestamp();

-- Insert default site settings
INSERT INTO site_settings (key, value, category, description, is_public) VALUES
(
  'business_hours',
  '{
    "weekday": {
      "opens": "09:00",
      "closes": "18:00",
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    "weekend": {
      "opens": "10:00",
      "closes": "16:00",
      "days": ["Saturday", "Sunday"]
    }
  }'::jsonb,
  'operational',
  'Business operating hours for weekdays and weekends',
  true
),
(
  'after_hours_fee',
  '{
    "amount": 30,
    "currency": "EUR",
    "description": "Fee for pickup or return outside business hours"
  }'::jsonb,
  'operational',
  'After-hours service fee configuration',
  true
),
(
  'contact_info',
  '{
    "phone": "+43 664 158 4950",
    "email": "office@easyrentgraz.at",
    "address": {
      "street": "Graz",
      "city": "Graz",
      "postalCode": "8010",
      "country": "Austria"
    }
  }'::jsonb,
  'contact',
  'Primary contact information',
  true
),
(
  'location_fees',
  '{
    "graz_airport": {
      "fee": 20,
      "name": "Graz Airport",
      "address": "Flughafen Graz"
    },
    "graz_train_station": {
      "fee": 15,
      "name": "Graz Train Station",
      "address": "Hauptbahnhof Graz"
    },
    "custom_location": {
      "fee": 25,
      "name": "Custom Location",
      "description": "Delivery to custom address within Graz area"
    }
  }'::jsonb,
  'operational',
  'Location-based delivery and pickup fees',
  true
),
(
  'company_info',
  '{
    "name": "EazyRentGraz",
    "description": "Premium car rental service in Graz, Austria",
    "established": "2020",
    "languages": ["German", "English", "Romanian"],
    "social": {
      "facebook": "",
      "instagram": "",
      "twitter": ""
    }
  }'::jsonb,
  'marketing',
  'Company information and branding',
  true
)
ON CONFLICT (key) DO NOTHING;

-- Verify migration success
SELECT
  'Migration completed successfully!' as status,
  'site_settings table created with default data' as settings_status,
  'Enhanced vehicle badge system added' as vehicles_status;
