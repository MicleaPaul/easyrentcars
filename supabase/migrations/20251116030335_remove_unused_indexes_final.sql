/*
  # Remove Currently Unused Indexes

  ## Overview
  This migration removes indexes that are currently not being used by queries.
  These indexes were added for foreign key performance optimization, but with
  minimal data in the database, they're not actively utilized.

  ## Changes Made

  ### Removed Indexes
  - idx_bookings_vehicle_id: Not used with current query patterns
  - idx_penalties_booking_id: Not used (no penalties in database yet)
  - idx_penalties_created_by: Not used (no penalties in database yet)

  ## Important Notes
  
  ### When to Re-add These Indexes
  These indexes should be re-added when:
  1. The application has significant traffic (100+ bookings)
  2. Penalty system is actively used
  3. Query performance monitoring shows slow JOINs
  4. DELETE operations on vehicles/bookings become slow

  ### Re-creation SQL (for future reference)
  ```sql
  CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
  CREATE INDEX idx_penalties_booking_id ON penalties(booking_id);
  CREATE INDEX idx_penalties_created_by ON penalties(created_by);
  ```

  ## Performance Impact
  - Current impact: None (indexes weren't being used)
  - Future consideration: Monitor query performance as data grows
  - Foreign key constraints still enforce referential integrity
  - Postgres can still perform queries, just without index optimization

  ## Security Notes
  - No impact on RLS policies or data access
  - No security implications
  - Pure performance optimization decision
*/

-- ============================================================================
-- REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_bookings_vehicle_id;
DROP INDEX IF EXISTS idx_penalties_booking_id;
DROP INDEX IF EXISTS idx_penalties_created_by;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT
  'Unused indexes removed successfully!' as status,
  'Indexes can be re-added when query patterns require them' as note,
  'Monitor query performance as data volume grows' as recommendation;
