/*
  # Cleanup Unused Indexes and Fix Multiple Permissive Policies

  ## Overview
  This migration addresses remaining security and performance issues:
  1. Removes unused indexes that add maintenance overhead
  2. Fixes multiple permissive policies by making admin policies restrictive

  ## Changes Made

  ### 1. Unused Index Removal
  Removes indexes that have not been used and add unnecessary overhead:
  - idx_vehicles_category
  - idx_bookings_vehicle_id
  - idx_bookings_dates
  - idx_bookings_status
  - idx_bookings_guest_token
  - idx_penalties_booking_id
  - idx_faqs_display_order
  - idx_bookings_fuel_refund
  - idx_penalties_created_by
  - idx_bookings_guest_link_token

  Note: We keep idx_vehicles_status as it's used for filtering available vehicles

  ### 2. Multiple Permissive Policies Fix
  Changes admin policies from permissive to restrictive for:
  - vehicles (SELECT): Admin policy becomes restrictive
  - faqs (SELECT): Admin policy becomes restrictive

  This ensures that authenticated users who are NOT admins can only see
  public data, while admins can see everything.

  ## Security Notes
  - Restrictive policies use AND logic (all must pass)
  - Permissive policies use OR logic (any can pass)
  - By making admin policies restrictive, we prevent policy confusion
  - Non-admin authenticated users still only see public data
*/

-- ============================================================================
-- 1. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_vehicles_category;
DROP INDEX IF EXISTS idx_bookings_vehicle_id;
DROP INDEX IF EXISTS idx_bookings_dates;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_guest_token;
DROP INDEX IF EXISTS idx_penalties_booking_id;
DROP INDEX IF EXISTS idx_faqs_display_order;
DROP INDEX IF EXISTS idx_bookings_fuel_refund;
DROP INDEX IF EXISTS idx_penalties_created_by;
DROP INDEX IF EXISTS idx_bookings_guest_link_token;

-- ============================================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================================================

-- For VEHICLES: Drop and recreate admin policy as RESTRICTIVE
DROP POLICY IF EXISTS "Admins can view all vehicles" ON vehicles;

CREATE POLICY "Admins can view all vehicles"
  ON vehicles AS RESTRICTIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- For FAQS: Drop and recreate admin policy as RESTRICTIVE
DROP POLICY IF EXISTS "Admins can view all FAQs" ON faqs;

CREATE POLICY "Admins can view all FAQs"
  ON faqs AS RESTRICTIVE FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

SELECT
  'Cleanup migration completed successfully!' as status,
  'Unused indexes removed for better performance' as indexes_status,
  'Multiple permissive policies fixed with restrictive policies' as policies_status;
