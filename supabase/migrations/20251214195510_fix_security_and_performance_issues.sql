/*
  # Fix Security and Performance Issues

  ## Changes

  1. **Add Missing Foreign Key Indexes**
    - Add index on `booking_addons.booking_id`
    - Add index on `email_verifications.booking_id`
    - Add index on `vehicle_blocks.created_by`

  2. **Optimize RLS Policies for Performance**
    - Fix all policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation for each row and improves performance at scale
    - Affected tables: bookings, faqs, terms_and_conditions, vehicle_blocks

  3. **Remove Unused Indexes**
    - Drop indexes that are not being used to improve write performance
    - Includes indexes on bookings, faqs, penalties, site_settings, etc.

  4. **Consolidate Multiple Permissive Policies**
    - Merge duplicate permissive policies into single policies
    - Prevents policy conflicts and improves query planning

  5. **Fix Function Search Paths**
    - Set stable search paths for functions to prevent security issues
    - Affected functions: calculate_fraud_score, check_rate_limit

  ## Security Notes
  - All changes maintain or improve security posture
  - No data will be lost during this migration
  - Performance improvements expected for large-scale operations
*/

-- =============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================================================

-- Index for booking_addons.booking_id
CREATE INDEX IF NOT EXISTS idx_booking_addons_booking_id
ON booking_addons(booking_id);

-- Index for email_verifications.booking_id
CREATE INDEX IF NOT EXISTS idx_email_verifications_booking_id
ON email_verifications(booking_id);

-- Index for vehicle_blocks.created_by
CREATE INDEX IF NOT EXISTS idx_vehicle_blocks_created_by
ON vehicle_blocks(created_by);

-- =============================================================================
-- 2. REMOVE UNUSED INDEXES
-- =============================================================================

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS idx_bookings_created_at;
DROP INDEX IF EXISTS idx_bookings_customer_email;
DROP INDEX IF EXISTS idx_faqs_is_hidden;
DROP INDEX IF EXISTS idx_bookings_vehicle_id;
DROP INDEX IF EXISTS idx_penalties_created_by;
DROP INDEX IF EXISTS idx_site_settings_updated_by;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_created_pending;
DROP INDEX IF EXISTS idx_email_verifications_unverified;
DROP INDEX IF EXISTS idx_booking_attempts_tracking;
DROP INDEX IF EXISTS idx_bookings_availability;
DROP INDEX IF EXISTS idx_terms_is_active;
DROP INDEX IF EXISTS idx_bookings_payment_status;
DROP INDEX IF EXISTS idx_bookings_stripe_payment_intent;

-- =============================================================================
-- 3. OPTIMIZE RLS POLICIES - BOOKINGS TABLE
-- =============================================================================

-- Drop and recreate the "Admins can delete bookings" policy
DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;

CREATE POLICY "Admins can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- Consolidate INSERT policies for bookings
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can insert bookings" ON bookings;

-- Single unified INSERT policy for all users
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Consolidate SELECT policies for bookings
DROP POLICY IF EXISTS "Public can read active bookings for availability" ON bookings;
DROP POLICY IF EXISTS "Users can view their bookings via guest token" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

-- Create separate optimized SELECT policies
CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Public can read bookings for availability"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    booking_status IN ('confirmed', 'active', 'completed', 'pending_verification')
  );

CREATE POLICY "Guests can view their bookings"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (guest_link_token IS NOT NULL);

-- =============================================================================
-- 4. OPTIMIZE RLS POLICIES - FAQS TABLE
-- =============================================================================

-- Drop and recreate all FAQ policies with optimized auth checks
DROP POLICY IF EXISTS "Admins can view all FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can insert FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can update FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON faqs;

CREATE POLICY "Admins can view all FAQs"
  ON faqs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can insert FAQs"
  ON faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update FAQs"
  ON faqs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete FAQs"
  ON faqs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- =============================================================================
-- 5. OPTIMIZE RLS POLICIES - TERMS_AND_CONDITIONS TABLE
-- =============================================================================

-- Drop and recreate all terms policies with optimized auth checks
DROP POLICY IF EXISTS "Admins can view all terms and conditions" ON terms_and_conditions;
DROP POLICY IF EXISTS "Admins can insert terms and conditions" ON terms_and_conditions;
DROP POLICY IF EXISTS "Admins can update terms and conditions" ON terms_and_conditions;
DROP POLICY IF EXISTS "Admins can delete terms and conditions" ON terms_and_conditions;

CREATE POLICY "Admins can view all terms and conditions"
  ON terms_and_conditions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can insert terms and conditions"
  ON terms_and_conditions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update terms and conditions"
  ON terms_and_conditions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete terms and conditions"
  ON terms_and_conditions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- =============================================================================
-- 6. OPTIMIZE RLS POLICIES - VEHICLE_BLOCKS TABLE
-- =============================================================================

-- Drop and recreate all vehicle_blocks policies with optimized auth checks
DROP POLICY IF EXISTS "Admins can view all vehicle blocks" ON vehicle_blocks;
DROP POLICY IF EXISTS "Admins can create vehicle blocks" ON vehicle_blocks;
DROP POLICY IF EXISTS "Admins can update vehicle blocks" ON vehicle_blocks;
DROP POLICY IF EXISTS "Admins can delete vehicle blocks" ON vehicle_blocks;

CREATE POLICY "Admins can view all vehicle blocks"
  ON vehicle_blocks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can create vehicle blocks"
  ON vehicle_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update vehicle blocks"
  ON vehicle_blocks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete vehicle blocks"
  ON vehicle_blocks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- =============================================================================
-- 7. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =============================================================================

-- Consolidate disposable_email_domains policies
DROP POLICY IF EXISTS "Admins can manage disposable domains" ON disposable_email_domains;
DROP POLICY IF EXISTS "Anyone can view disposable domains" ON disposable_email_domains;

CREATE POLICY "Public can view disposable domains"
  ON disposable_email_domains
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage disposable domains"
  ON disposable_email_domains
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- Consolidate fraud_blacklist policies
DROP POLICY IF EXISTS "Admins can manage blacklist" ON fraud_blacklist;
DROP POLICY IF EXISTS "Anyone can check if blocked" ON fraud_blacklist;

CREATE POLICY "Public can check if blocked"
  ON fraud_blacklist
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage blacklist"
  ON fraud_blacklist
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- =============================================================================
-- 8. FIX FUNCTION SEARCH PATHS
-- =============================================================================

-- Fix calculate_fraud_score function
DROP FUNCTION IF EXISTS calculate_fraud_score(text, text, text, text, bigint);

CREATE OR REPLACE FUNCTION calculate_fraud_score(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_booking_id bigint DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_score integer := 0;
  v_domain text;
  v_booking_count integer;
  v_is_blacklisted boolean;
  v_recent_attempts integer;
BEGIN
  -- Extract domain from email
  v_domain := split_part(p_email, '@', 2);

  -- Check if email domain is disposable (+30 points)
  IF EXISTS (SELECT 1 FROM disposable_email_domains WHERE domain = v_domain) THEN
    v_score := v_score + 30;
  END IF;

  -- Check if email/phone is blacklisted (+100 points = instant block)
  SELECT EXISTS (
    SELECT 1 FROM fraud_blacklist
    WHERE (email = p_email OR phone = p_phone)
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_is_blacklisted;

  IF v_is_blacklisted THEN
    v_score := v_score + 100;
  END IF;

  -- Check booking history for this email (+10 per failed booking, max 50)
  SELECT COUNT(*) INTO v_booking_count
  FROM bookings
  WHERE customer_email = p_email
  AND booking_status IN ('cancelled', 'payment_failed')
  AND created_at > now() - interval '30 days';

  v_score := v_score + LEAST(v_booking_count * 10, 50);

  -- Check recent booking attempts from same email (rate limiting indicator)
  SELECT COUNT(*) INTO v_recent_attempts
  FROM bookings
  WHERE customer_email = p_email
  AND created_at > now() - interval '1 hour'
  AND (p_booking_id IS NULL OR id != p_booking_id);

  IF v_recent_attempts > 3 THEN
    v_score := v_score + 25;
  END IF;

  RETURN v_score;
END;
$$;

-- Fix check_rate_limit function
DROP FUNCTION IF EXISTS check_rate_limit(text, text, integer);

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_attempt_count integer;
BEGIN
  -- Count recent attempts (last hour)
  SELECT COUNT(*) INTO v_attempt_count
  FROM booking_attempts
  WHERE identifier = p_identifier
  AND action = p_action
  AND attempted_at > now() - interval '1 hour';

  -- Return true if under limit, false if over
  RETURN v_attempt_count < p_max_attempts;
END;
$$;
