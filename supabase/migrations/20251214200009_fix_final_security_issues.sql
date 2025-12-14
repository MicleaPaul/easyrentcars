/*
  # Fix Final Security and Performance Issues

  ## Changes

  1. **Add Missing Foreign Key Indexes**
    - Add index on `booking_addons.booking_id`
    - Add index on `email_verifications.booking_id`
    - Add index on `vehicle_blocks.created_by`

  2. **Remove Unused Indexes**
    - Drop indexes that are not being used in queries
    - Includes: idx_bookings_vehicle_id_fkey, idx_penalties_created_by_fkey, idx_site_settings_updated_by_fkey

  3. **Fix Multiple Permissive Policies**
    - Separate ALL policies into specific INSERT, UPDATE, DELETE policies
    - Prevents duplicate SELECT policy coverage
    - Affected tables: disposable_email_domains, fraud_blacklist

  ## Security Notes
  - All changes maintain or improve security posture
  - No data will be lost during this migration
  - Performance improvements expected for write operations
*/

-- =============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================================================

-- Index for booking_addons.booking_id
CREATE INDEX IF NOT EXISTS idx_booking_addons_booking_id_fkey
ON booking_addons(booking_id);

-- Index for email_verifications.booking_id
CREATE INDEX IF NOT EXISTS idx_email_verifications_booking_id_fkey
ON email_verifications(booking_id);

-- Index for vehicle_blocks.created_by
CREATE INDEX IF NOT EXISTS idx_vehicle_blocks_created_by_fkey
ON vehicle_blocks(created_by);

-- =============================================================================
-- 2. REMOVE UNUSED INDEXES
-- =============================================================================

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS idx_bookings_vehicle_id_fkey;
DROP INDEX IF EXISTS idx_penalties_created_by_fkey;
DROP INDEX IF EXISTS idx_site_settings_updated_by_fkey;

-- =============================================================================
-- 3. FIX MULTIPLE PERMISSIVE POLICIES
-- =============================================================================

-- Fix disposable_email_domains policies
-- Drop the ALL policy that causes duplicate SELECT coverage
DROP POLICY IF EXISTS "Admins can manage disposable domains" ON disposable_email_domains;

-- Create separate policies for INSERT, UPDATE, DELETE (not ALL)
CREATE POLICY "Admins can insert disposable domains"
  ON disposable_email_domains
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update disposable domains"
  ON disposable_email_domains
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

CREATE POLICY "Admins can delete disposable domains"
  ON disposable_email_domains
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- Fix fraud_blacklist policies
-- Drop the ALL policy that causes duplicate SELECT coverage
DROP POLICY IF EXISTS "Admins can manage blacklist" ON fraud_blacklist;

-- Create separate policies for INSERT, UPDATE, DELETE (not ALL)
CREATE POLICY "Admins can insert to blacklist"
  ON fraud_blacklist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update blacklist"
  ON fraud_blacklist
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

CREATE POLICY "Admins can delete from blacklist"
  ON fraud_blacklist
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );
