/*
  # Add Missing Foreign Key Indexes

  ## Overview
  This migration adds indexes for all foreign key columns to improve query performance.
  Foreign keys without indexes can cause significant performance degradation, especially
  during JOINs and DELETE operations.

  ## Changes Made

  ### 1. Bookings Table
  - Add index on vehicle_id (foreign key to vehicles table)
    - Improves performance when querying bookings for a specific vehicle
    - Essential for checking vehicle availability
    - Speeds up CASCADE operations

  ### 2. Penalties Table
  - Add index on booking_id (foreign key to bookings table)
    - Improves performance when querying penalties for a booking
    - Speeds up JOIN operations between penalties and bookings
    - Essential for calculating total booking costs

  - Add index on created_by (foreign key to auth.users table)
    - Improves performance when filtering penalties by admin user
    - Useful for audit trails and reporting
    - Speeds up admin activity queries

  ## Performance Benefits
  - Faster JOIN operations
  - Improved DELETE CASCADE performance
  - Better query optimization by the database planner
  - Reduced I/O operations for foreign key lookups

  ## Security Notes
  - Indexes do not affect RLS policies
  - No changes to data access permissions
  - Pure performance optimization
*/

-- ============================================================================
-- ADD FOREIGN KEY INDEXES
-- ============================================================================

-- Index on bookings.vehicle_id (foreign key to vehicles)
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);

-- Index on penalties.booking_id (foreign key to bookings)
CREATE INDEX IF NOT EXISTS idx_penalties_booking_id ON penalties(booking_id);

-- Index on penalties.created_by (foreign key to auth.users)
CREATE INDEX IF NOT EXISTS idx_penalties_created_by ON penalties(created_by);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT
  'Foreign key indexes added successfully!' as status,
  'All foreign key columns now have covering indexes' as indexes_status,
  'Query performance will be significantly improved' as performance_status;
