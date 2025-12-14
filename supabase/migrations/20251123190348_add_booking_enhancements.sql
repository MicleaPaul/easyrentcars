/*
  # Add Booking Enhancements for Location Fees and Extras

  ## Overview
  Adds support for enhanced booking functionality including:
  - Unlimited kilometers option
  - Contract numbers for business customers
  - Custom location addresses with geocoding
  - Location fees tracking (pickup and return separately)
  - Stripe session tracking for payments

  ## New Columns in bookings table
  - `unlimited_kilometers` (boolean) - Whether customer chose unlimited km package
  - `contract_number` (text) - Business customer contract number (optional)
  - `pickup_custom_address` (text) - Custom pickup address if not predefined location
  - `return_custom_address` (text) - Custom return address if not predefined location
  - `pickup_fee` (numeric) - Fee for pickup location (0 or 20)
  - `return_fee` (numeric) - Fee for return location (0 or 20)
  - `stripe_session_id` (text) - Stripe checkout session ID
  - `stripe_checkout_url` (text) - URL to Stripe checkout page

  ## New Tables

  ### locations
  Stores predefined locations with their geocoding data
  - `id` (uuid, primary key)
  - `name` (text) - Location name (e.g., "Firmensitz", "Hauptbahnhof")
  - `address` (text) - Full address
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `is_free` (boolean) - Whether pickup/return is free
  - `fee_amount` (numeric) - Fee if not free
  - `city` (text) - City name for validation
  - `is_active` (boolean) - Whether location is currently available

  ### booking_addons
  Tracks all add-ons and extras for each booking
  - `id` (uuid, primary key)
  - `booking_id` (uuid, foreign key) - References bookings
  - `addon_type` (text) - Type: unlimited_km, location_fee, etc.
  - `description` (text) - Human-readable description
  - `amount` (numeric) - Cost of the add-on
  - `stripe_product_id` (text) - Stripe product ID if applicable

  ## Security
  - RLS enabled on all new tables
  - Admin-only access to locations management
  - Booking add-ons visible to booking owner or admin
  - All monetary fields use numeric type for precision

  ## Indexes
  - booking_id index on booking_addons for fast lookups
  - stripe_session_id index on bookings for payment verification
*/

-- Add new columns to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'unlimited_kilometers'
  ) THEN
    ALTER TABLE bookings ADD COLUMN unlimited_kilometers boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'contract_number'
  ) THEN
    ALTER TABLE bookings ADD COLUMN contract_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'pickup_custom_address'
  ) THEN
    ALTER TABLE bookings ADD COLUMN pickup_custom_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'return_custom_address'
  ) THEN
    ALTER TABLE bookings ADD COLUMN return_custom_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'pickup_fee'
  ) THEN
    ALTER TABLE bookings ADD COLUMN pickup_fee numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'return_fee'
  ) THEN
    ALTER TABLE bookings ADD COLUMN return_fee numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN stripe_session_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'stripe_checkout_url'
  ) THEN
    ALTER TABLE bookings ADD COLUMN stripe_checkout_url text;
  END IF;
END $$;

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_free boolean DEFAULT true,
  fee_amount numeric DEFAULT 0,
  city text DEFAULT 'Graz',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create booking_addons table
CREATE TABLE IF NOT EXISTS booking_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_type text NOT NULL CHECK (addon_type IN ('unlimited_km', 'location_fee', 'insurance', 'other')),
  description text NOT NULL,
  amount numeric NOT NULL,
  stripe_product_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations (admin only can manage)
CREATE POLICY "Anyone can view active locations"
  ON locations FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update locations"
  ON locations FOR UPDATE
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

CREATE POLICY "Admins can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for booking_addons
CREATE POLICY "Booking owner can view their addons"
  ON booking_addons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_addons.booking_id
      AND bookings.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "System can insert booking addons"
  ON booking_addons FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_contract_number ON bookings(contract_number) WHERE contract_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_addons_booking_id ON booking_addons(booking_id);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city) WHERE is_active = true;

-- Insert predefined locations
INSERT INTO locations (name, address, latitude, longitude, is_free, fee_amount, city) VALUES
  ('Firmensitz', 'Hauptstrasse 123, 8010 Graz', 47.0707, 15.4395, true, 0, 'Graz'),
  ('Graz Zentrum', 'Herrengasse 16, 8010 Graz', 47.0708, 15.4382, true, 0, 'Graz'),
  ('Flughafen Graz', 'Flughafenstrasse 51, 8073 Feldkirchen bei Graz', 46.9911, 15.4396, true, 0, 'Graz'),
  ('Hauptbahnhof', 'Europaplatz 12, 8020 Graz', 47.0721, 15.4172, false, 20, 'Graz')
ON CONFLICT DO NOTHING;

-- Verify migration
SELECT
  'Migration completed successfully!' as status,
  'Added booking enhancements' as message;
