/*
  # Fix Security and Performance Issues

  Addresses security and performance issues:
  - Add missing foreign key indexes
  - Optimize RLS policies with SELECT pattern
  - Remove unused indexes
  - Consolidate duplicate policies
  - Fix function search paths
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_penalties_booking_id ON penalties(booking_id);
CREATE INDEX IF NOT EXISTS idx_penalties_created_by ON penalties(created_by);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON site_settings(updated_by);

-- Drop unused indexes
DROP INDEX IF EXISTS idx_site_settings_category;
DROP INDEX IF EXISTS idx_site_settings_is_public;
DROP INDEX IF EXISTS idx_vehicles_badge_type;
DROP INDEX IF EXISTS idx_vehicles_priority_order;
DROP INDEX IF EXISTS idx_vehicles_badge_expires_at;
DROP INDEX IF EXISTS idx_bookings_stripe_session;
DROP INDEX IF EXISTS idx_bookings_contract_number;
DROP INDEX IF EXISTS idx_booking_addons_booking_id;
DROP INDEX IF EXISTS idx_locations_city;
DROP INDEX IF EXISTS idx_bookings_status_dates;
DROP INDEX IF EXISTS idx_bookings_setup_intent;
DROP INDEX IF EXISTS idx_bookings_fingerprint;
DROP INDEX IF EXISTS idx_bookings_ip;
DROP INDEX IF EXISTS idx_email_verifications_token;
DROP INDEX IF EXISTS idx_email_verifications_booking;
DROP INDEX IF EXISTS idx_email_verifications_expires;
DROP INDEX IF EXISTS idx_email_verifications_email;
DROP INDEX IF EXISTS idx_attempts_ip_time;
DROP INDEX IF EXISTS idx_attempts_email_time;
DROP INDEX IF EXISTS idx_attempts_phone_time;
DROP INDEX IF EXISTS idx_attempts_fingerprint_time;
DROP INDEX IF EXISTS idx_attempts_blocked;
DROP INDEX IF EXISTS idx_blacklist_email;
DROP INDEX IF EXISTS idx_blacklist_phone;
DROP INDEX IF EXISTS idx_blacklist_ip;
DROP INDEX IF EXISTS idx_blacklist_fingerprint;

-- Fix RLS policies - SITE_SETTINGS
DROP POLICY IF EXISTS "Admins can view all settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON site_settings;

CREATE POLICY "Admins can view all settings"
  ON site_settings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Admins can insert settings"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Admins can update settings"
  ON site_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Admins can delete settings"
  ON site_settings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

-- Fix RLS policies - STRIPE_CUSTOMERS
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix RLS policies - STRIPE_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = (SELECT auth.uid())));

-- Fix RLS policies - STRIPE_ORDERS
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = (SELECT auth.uid())));

-- Fix RLS policies - LOCATIONS
DROP POLICY IF EXISTS "Admins can insert locations" ON locations;
DROP POLICY IF EXISTS "Admins can update locations" ON locations;
DROP POLICY IF EXISTS "Admins can delete locations" ON locations;

CREATE POLICY "Admins can insert locations"
  ON locations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Admins can update locations"
  ON locations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

CREATE POLICY "Admins can delete locations"
  ON locations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

-- Fix RLS policies - ADMIN_USERS
DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;

CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

-- Fix RLS policies - BOOKING_ADDONS
DROP POLICY IF EXISTS "Booking owner can view their addons" ON booking_addons;

CREATE POLICY "Booking owner can view their addons"
  ON booking_addons FOR SELECT TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    )
  );

-- Consolidate policies - DISPOSABLE_EMAIL_DOMAINS
DROP POLICY IF EXISTS "Public can check disposable domains" ON disposable_email_domains;
DROP POLICY IF EXISTS "Admins can manage disposable domains" ON disposable_email_domains;

CREATE POLICY "Anyone can view disposable domains"
  ON disposable_email_domains FOR SELECT USING (true);

CREATE POLICY "Admins can manage disposable domains"
  ON disposable_email_domains FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

-- Consolidate policies - FRAUD_BLACKLIST
DROP POLICY IF EXISTS "Public can check if blocked" ON fraud_blacklist;
DROP POLICY IF EXISTS "Admins can manage blacklist" ON fraud_blacklist;

CREATE POLICY "Anyone can check if blocked"
  ON fraud_blacklist FOR SELECT USING (true);

CREATE POLICY "Admins can manage blacklist"
  ON fraud_blacklist FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = (SELECT auth.uid())));

-- Fix site_settings public policy
DROP POLICY IF EXISTS "Public can view public settings" ON site_settings;

CREATE POLICY "Public can view public settings"
  ON site_settings FOR SELECT TO anon
  USING (is_public = true);

-- Fix function search paths
ALTER FUNCTION check_rate_limit SET search_path = public, pg_temp;
ALTER FUNCTION calculate_fraud_score SET search_path = public, pg_temp;
ALTER FUNCTION expire_old_bookings SET search_path = public, pg_temp;
ALTER FUNCTION update_site_settings_timestamp SET search_path = public, pg_temp;

-- Add essential indexes for booking flow
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status) 
  WHERE booking_status IN ('PendingVerification', 'PendingPayment');

CREATE INDEX IF NOT EXISTS idx_bookings_created_pending ON bookings(created_at, booking_status);

CREATE INDEX IF NOT EXISTS idx_email_verifications_unverified ON email_verifications(expires_at) 
  WHERE verified = false;

CREATE INDEX IF NOT EXISTS idx_booking_attempts_tracking ON booking_attempts(ip_address, created_at);

CREATE INDEX IF NOT EXISTS idx_bookings_availability 
  ON bookings(vehicle_id, pickup_date, return_date, booking_status) 
  WHERE booking_status IN ('Confirmed', 'Active');
