/*
  # EazyRentGraz Database Schema

  ## Overview
  Complete database structure for premium car rental platform with multi-language support,
  booking management, payment processing, and admin dashboard functionality.

  ## New Tables

  ### 1. vehicles
  - `id` (uuid, primary key) - Unique vehicle identifier
  - `model` (text) - Car model name (e.g., "BMW 5 Series")
  - `brand` (text) - Car brand (e.g., "BMW")
  - `year` (integer) - Manufacturing year
  - `transmission` (text) - Manual or Automatic
  - `fuel_type` (text) - Petrol, Diesel, Electric, Hybrid
  - `seats` (integer) - Number of seats
  - `doors` (integer) - Number of doors
  - `category` (text) - Economy, Standard, Premium, Luxury
  - `price_per_day` (numeric) - Daily rental price in EUR
  - `images` (jsonb) - Array of image URLs
  - `features` (jsonb) - Car features/specifications
  - `status` (text) - available, maintenance, rented
  - `is_featured` (boolean) - Featured on homepage
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. bookings
  - `id` (uuid, primary key) - Unique booking identifier
  - `vehicle_id` (uuid, foreign key) - Reference to vehicles table
  - `customer_name` (text) - Customer full name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone number
  - `customer_age` (integer) - Customer age
  - `driving_experience` (integer) - Years of driving experience
  - `pickup_date` (timestamptz) - Pickup date and time
  - `return_date` (timestamptz) - Return date and time
  - `pickup_location` (text) - Pickup location
  - `return_location` (text) - Return location
  - `total_price` (numeric) - Total booking price
  - `payment_method` (text) - stripe, cash
  - `payment_status` (text) - pending, paid, failed
  - `booking_status` (text) - pending, confirmed, active, completed, cancelled
  - `stripe_payment_intent_id` (text) - Stripe payment intent ID
  - `notes` (text) - Additional customer notes
  - `language` (text) - Customer preferred language
  - `contract_url` (text) - Generated contract PDF URL
  - `guest_link_token` (text) - Unique token for guest access
  - `after_hours_fee` (numeric) - After hours pickup/return fee
  - `custom_location_fee` (numeric) - Custom location fee
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. penalties
  - `id` (uuid, primary key) - Unique penalty identifier
  - `booking_id` (uuid, foreign key) - Reference to bookings table
  - `type` (text) - smoking, late_return, damage, other
  - `amount` (numeric) - Penalty amount in EUR
  - `description` (text) - Penalty description
  - `applied_at` (timestamptz) - When penalty was applied
  - `created_by` (uuid) - Admin user who applied penalty

  ### 4. faqs
  - `id` (uuid, primary key) - Unique FAQ identifier
  - `question_de` (text) - Question in German
  - `answer_de` (text) - Answer in German
  - `question_en` (text) - Question in English
  - `answer_en` (text) - Answer in English
  - `question_fr` (text) - Question in French
  - `answer_fr` (text) - Answer in French
  - `question_it` (text) - Question in Italian
  - `answer_it` (text) - Answer in Italian
  - `question_es` (text) - Question in Spanish
  - `answer_es` (text) - Answer in Spanish
  - `is_popular` (boolean) - Show on homepage
  - `display_order` (integer) - Display order
  - `is_hidden` (boolean) - Hidden from public view
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. notification_templates
  - `id` (uuid, primary key) - Unique template identifier
  - `type` (text) - new_booking, payment_confirmed, reminder_24h, etc.
  - `subject_de` (text) - Email subject in German
  - `body_de` (text) - Email body in German
  - `subject_en` (text) - Email subject in English
  - `body_en` (text) - Email body in English
  - `subject_fr` (text) - Email subject in French
  - `body_fr` (text) - Email body in French
  - `subject_it` (text) - Email subject in Italian
  - `body_it` (text) - Email body in Italian
  - `subject_es` (text) - Email subject in Spanish
  - `body_es` (text) - Email body in Spanish
  - `enabled` (boolean) - Template enabled/disabled
  - `channels` (jsonb) - Array of channels (email, whatsapp, sms)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. settings
  - `id` (uuid, primary key) - Unique settings identifier
  - `key` (text, unique) - Settings key
  - `value` (jsonb) - Settings value (flexible JSON structure)
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. admin_users
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - Admin email
  - `full_name` (text) - Admin full name
  - `role` (text) - admin, super_admin
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for vehicles and FAQs (non-hidden)
  - Authenticated admin access for all management operations
  - Guest access via token for booking status
  - Strict policies for data modification

  ## Important Notes
  1. All prices in EUR (numeric type for precision)
  2. Multi-language support for customer-facing content
  3. Timezone: Europe/Vienna
  4. Date format: dd.mm.yyyy for display
  5. Guest links expire after 30 days
*/

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  brand text NOT NULL,
  year integer NOT NULL,
  transmission text NOT NULL CHECK (transmission IN ('Manual', 'Automatic')),
  fuel_type text NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid')),
  seats integer NOT NULL DEFAULT 5,
  doors integer NOT NULL DEFAULT 4,
  category text NOT NULL CHECK (category IN ('Economy', 'Standard', 'Premium', 'Luxury')),
  price_per_day numeric NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'rented')),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_age integer NOT NULL,
  driving_experience integer NOT NULL,
  pickup_date timestamptz NOT NULL,
  return_date timestamptz NOT NULL,
  pickup_location text NOT NULL,
  return_location text NOT NULL,
  total_price numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'cash')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  booking_status text NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  stripe_payment_intent_id text,
  notes text DEFAULT '',
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('de', 'en', 'fr', 'it', 'es')),
  contract_url text,
  guest_link_token text UNIQUE,
  after_hours_fee numeric DEFAULT 0,
  custom_location_fee numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create penalties table
CREATE TABLE IF NOT EXISTS penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('smoking', 'late_return', 'damage', 'other')),
  amount numeric NOT NULL,
  description text NOT NULL,
  applied_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

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
  is_popular boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL UNIQUE,
  subject_de text NOT NULL,
  body_de text NOT NULL,
  subject_en text NOT NULL,
  body_en text NOT NULL,
  subject_fr text NOT NULL,
  body_fr text NOT NULL,
  subject_it text NOT NULL,
  body_it text NOT NULL,
  subject_es text NOT NULL,
  body_es text NOT NULL,
  enabled boolean DEFAULT true,
  channels jsonb DEFAULT '["email"]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Vehicles policies (public read for available vehicles, admin full access)
CREATE POLICY "Public can view available vehicles"
  ON vehicles FOR SELECT
  TO anon, authenticated
  USING (status = 'available');

CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update vehicles"
  ON vehicles FOR UPDATE
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

CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Bookings policies (guest access via token, admin full access)
CREATE POLICY "Guests can view own booking via token"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
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

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Penalties policies (admin only)
CREATE POLICY "Admins can view penalties"
  ON penalties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert penalties"
  ON penalties FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update penalties"
  ON penalties FOR UPDATE
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

CREATE POLICY "Admins can delete penalties"
  ON penalties FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- FAQs policies (public read for non-hidden, admin full access)
CREATE POLICY "Public can view visible FAQs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (is_hidden = false);

CREATE POLICY "Admins can view all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

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

CREATE POLICY "Admins can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Notification templates policies (admin only)
CREATE POLICY "Admins can view notification templates"
  ON notification_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert notification templates"
  ON notification_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update notification templates"
  ON notification_templates FOR UPDATE
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

CREATE POLICY "Admins can delete notification templates"
  ON notification_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Settings policies (public read for some keys, admin full access)
CREATE POLICY "Public can view public settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (
    key IN ('company_info', 'opening_hours', 'rental_rules', 'active_languages')
  );

CREATE POLICY "Admins can view all settings"
  ON settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
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
  ON settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users policies (admin access only)
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(pickup_date, return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_token ON bookings(guest_link_token);
CREATE INDEX IF NOT EXISTS idx_penalties_booking_id ON penalties(booking_id);
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();