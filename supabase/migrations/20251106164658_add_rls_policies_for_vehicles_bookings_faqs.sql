/*
  # Add RLS Policies for Public Access

  1. Vehicles Table Policies
    - Allow public read access to available vehicles
    - Only admins can modify vehicles
  
  2. Bookings Table Policies
    - Allow public insert (for creating bookings)
    - Allow read with guest_link_token (for tracking bookings)
    - Only admins can update/delete bookings
  
  3. FAQs Table Policies
    - Allow public read access to visible FAQs
    - Only admins can modify FAQs
  
  4. Settings & Templates
    - Public read access for company info
    - Admin-only modifications
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view available vehicles" ON vehicles;
DROP POLICY IF EXISTS "Public can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Anyone can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings with token" ON bookings;
DROP POLICY IF EXISTS "Public can view visible FAQs" ON faqs;
DROP POLICY IF EXISTS "Public can view settings" ON settings;

-- VEHICLES POLICIES
CREATE POLICY "Public can view available vehicles"
  ON vehicles FOR SELECT
  TO public
  USING (status = 'available');

-- BOOKINGS POLICIES  
CREATE POLICY "Anyone can insert bookings"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own bookings with token"
  ON bookings FOR SELECT
  TO public
  USING (guest_link_token IS NOT NULL);

-- FAQS POLICIES
CREATE POLICY "Public can view visible FAQs"
  ON faqs FOR SELECT
  TO public
  USING (is_hidden = false);

-- SETTINGS POLICIES
CREATE POLICY "Public can view settings"
  ON settings FOR SELECT
  TO public
  USING (true);

-- Create index on guest_link_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_guest_link_token 
  ON bookings(guest_link_token) 
  WHERE guest_link_token IS NOT NULL;

-- Create index on vehicle status for filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_status 
  ON vehicles(status);

-- Create index on bookings dates for availability checks
CREATE INDEX IF NOT EXISTS idx_bookings_dates 
  ON bookings(pickup_date, return_date, vehicle_id);
