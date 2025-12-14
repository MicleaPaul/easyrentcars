/*
  # Fix Remaining Security and Performance Issues

  ## Changes

  1. **Add Missing Foreign Key Indexes**
    - Add index on `bookings.vehicle_id`
    - Add index on `penalties.created_by`
    - Add index on `site_settings.updated_by`

  2. **Remove Unused Indexes**
    - Drop indexes that were just created but are not being used
    - Includes: idx_booking_addons_booking_id, idx_email_verifications_booking_id, idx_vehicle_blocks_created_by

  3. **Consolidate Multiple Permissive Policies**
    - Merge multiple SELECT policies into single policies to improve query planning
    - Affected tables: bookings, disposable_email_domains, faqs, fraud_blacklist, terms_and_conditions

  4. **Fix Function Search Paths (Complete Cleanup)**
    - Drop all versions of functions with mutable search paths
    - Recreate only the versions that are actually being used
    - Affected functions: calculate_fraud_score, check_rate_limit

  ## Security Notes
  - All changes maintain or improve security posture
  - No data will be lost during this migration
  - Performance improvements expected for large-scale operations
*/

-- =============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================================================

-- Index for bookings.vehicle_id
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id_fkey
ON bookings(vehicle_id);

-- Index for penalties.created_by
CREATE INDEX IF NOT EXISTS idx_penalties_created_by_fkey
ON penalties(created_by);

-- Index for site_settings.updated_by
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by_fkey
ON site_settings(updated_by);

-- =============================================================================
-- 2. REMOVE UNUSED INDEXES
-- =============================================================================

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS idx_booking_addons_booking_id;
DROP INDEX IF EXISTS idx_email_verifications_booking_id;
DROP INDEX IF EXISTS idx_vehicle_blocks_created_by;

-- =============================================================================
-- 3. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =============================================================================

-- Consolidate bookings SELECT policies into a single policy
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Public can read bookings for availability" ON bookings;
DROP POLICY IF EXISTS "Guests can view their bookings" ON bookings;

CREATE POLICY "Users can view bookings"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Admins can view all bookings
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
    OR
    -- Public can read bookings for availability
    booking_status IN ('confirmed', 'active', 'completed', 'pending_verification')
    OR
    -- Guests can view their bookings via token
    guest_link_token IS NOT NULL
  );

-- Consolidate disposable_email_domains SELECT policies
DROP POLICY IF EXISTS "Public can view disposable domains" ON disposable_email_domains;
DROP POLICY IF EXISTS "Admins can manage disposable domains" ON disposable_email_domains;

-- Single SELECT policy for all users
CREATE POLICY "Anyone can view disposable domains"
  ON disposable_email_domains
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Single admin management policy (INSERT, UPDATE, DELETE)
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

-- Consolidate faqs SELECT policies
DROP POLICY IF EXISTS "Admins can view all FAQs" ON faqs;
DROP POLICY IF EXISTS "Public can view visible FAQs" ON faqs;

CREATE POLICY "Users can view FAQs"
  ON faqs
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Admins can view all FAQs
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
    OR
    -- Public can view visible FAQs
    is_hidden = false
  );

-- Consolidate fraud_blacklist SELECT policies
DROP POLICY IF EXISTS "Public can check if blocked" ON fraud_blacklist;
DROP POLICY IF EXISTS "Admins can manage blacklist" ON fraud_blacklist;

-- Single SELECT policy for all users
CREATE POLICY "Anyone can check if blocked"
  ON fraud_blacklist
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Single admin management policy
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

-- Consolidate terms_and_conditions SELECT policies
DROP POLICY IF EXISTS "Admins can view all terms and conditions" ON terms_and_conditions;
DROP POLICY IF EXISTS "Public can view active terms and conditions" ON terms_and_conditions;

CREATE POLICY "Users can view terms and conditions"
  ON terms_and_conditions
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Admins can view all terms
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
    OR
    -- Public can view active terms
    is_active = true
  );

-- =============================================================================
-- 4. FIX FUNCTION SEARCH PATHS (COMPLETE CLEANUP)
-- =============================================================================

-- Drop ALL versions of calculate_fraud_score with specific signatures
DROP FUNCTION IF EXISTS calculate_fraud_score(text, text, inet, text);
DROP FUNCTION IF EXISTS calculate_fraud_score(text, text, text);
DROP FUNCTION IF EXISTS calculate_fraud_score(text, text, text, text, bigint);

-- Recreate the version used by check-fraud-score edge function
CREATE FUNCTION calculate_fraud_score(
  p_email text,
  p_phone text,
  p_ip_address inet,
  p_fingerprint text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_score INT := 0;
  v_domain TEXT;
BEGIN
  v_domain := SPLIT_PART(p_email, '@', 2);
  
  IF EXISTS (SELECT 1 FROM disposable_email_domains WHERE domain = v_domain) THEN
    v_score := v_score + 50;
  END IF;

  IF EXISTS (
    SELECT 1 FROM fraud_blacklist
    WHERE (email = p_email OR phone = p_phone OR ip_address = p_ip_address)
    AND (blocked_until IS NULL OR blocked_until > NOW())
  ) THEN
    v_score := v_score + 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE customer_email = p_email AND booking_status IN ('Completed', 'Active')
  ) THEN
    v_score := v_score + 20;
  END IF;

  RETURN v_score;
END;
$$;

-- Drop ALL versions of check_rate_limit with specific signatures
DROP FUNCTION IF EXISTS check_rate_limit(inet, text, text, text);
DROP FUNCTION IF EXISTS check_rate_limit(text, integer, interval);
DROP FUNCTION IF EXISTS check_rate_limit(text, text, integer);

-- Recreate the version used by check-fraud-score edge function
CREATE FUNCTION check_rate_limit(
  p_ip_address inet,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS TABLE(allowed boolean, reason text, wait_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_ip_count INT;
  v_email_count INT;
BEGIN
  SELECT COUNT(*) INTO v_ip_count FROM booking_attempts
  WHERE ip_address = p_ip_address AND created_at > NOW() - INTERVAL '1 hour';

  IF v_ip_count >= 3 THEN
    RETURN QUERY SELECT FALSE, 'Too many attempts from this IP', 3600;
    RETURN;
  END IF;

  IF p_email IS NOT NULL THEN
    SELECT COUNT(*) INTO v_email_count FROM bookings
    WHERE customer_email = p_email
    AND booking_status IN ('PendingVerification', 'PendingPayment')
    AND created_at > NOW() - INTERVAL '24 hours';

    IF v_email_count >= 2 THEN
      RETURN QUERY SELECT FALSE, 'Too many pending bookings', 86400;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT TRUE, 'Allowed', 0;
END;
$$;
