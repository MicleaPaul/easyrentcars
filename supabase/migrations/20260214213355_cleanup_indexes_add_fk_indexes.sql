/*
  # Cleanup Indexes and Add Missing FK Indexes

  1. New Indexes
    - `idx_penalties_created_by` on `penalties(created_by)` - covers FK penalties_created_by_fkey
    - `idx_site_settings_updated_by` on `site_settings(updated_by)` - covers FK site_settings_updated_by_fkey

  2. Dropped Duplicate Indexes
    - `idx_bookings_status` - exact duplicate of `idx_bookings_booking_status`
    - `idx_checkout_holds_expires_at` - exact duplicate of `idx_checkout_holds_expires`
    - `idx_checkout_holds_vehicle_dates` - exact duplicate of `idx_checkout_holds_availability`

  3. Dropped Redundant Indexes
    - `idx_admin_users_id` - redundant with primary key index
    - `idx_bookings_availability_check` - superseded by `idx_bookings_active_by_vehicle` which covers same columns plus booking_status
    - `idx_bookings_vehicle_dates` - superseded by `idx_bookings_active_by_vehicle`
    - `idx_vehicle_blocks_created_by_fkey` - unused FK index on low-cardinality admin table

  4. Important Notes
    - All remaining indexes are kept because they serve important query patterns
      (Stripe lookups, customer email search, fraud checks, rate limiting, availability)
    - No data is modified by this migration
*/

-- Add missing FK indexes
CREATE INDEX IF NOT EXISTS idx_penalties_created_by
  ON public.penalties USING btree (created_by);

CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by
  ON public.site_settings USING btree (updated_by);

-- Drop exact duplicate indexes (keep one of each pair)
DROP INDEX IF EXISTS public.idx_bookings_status;
DROP INDEX IF EXISTS public.idx_checkout_holds_expires_at;
DROP INDEX IF EXISTS public.idx_checkout_holds_vehicle_dates;

-- Drop redundant indexes
DROP INDEX IF EXISTS public.idx_admin_users_id;
DROP INDEX IF EXISTS public.idx_bookings_availability_check;
DROP INDEX IF EXISTS public.idx_bookings_vehicle_dates;
DROP INDEX IF EXISTS public.idx_vehicle_blocks_created_by_fkey;
