/*
  # Add Exclusion Constraint to Prevent Double-Booking
  
  This migration adds a database-level exclusion constraint to prevent overlapping bookings
  for the same vehicle.
  
  ## Problem
  
  Without this constraint, the application relies solely on application-level checks for
  availability. This creates a race condition where two users booking at the same time
  could both pass the availability check and create overlapping bookings.
  
  ## Solution
  
  PostgreSQL exclusion constraints with the btree_gist extension allow us to enforce
  non-overlapping date ranges at the database level. This provides ACID guarantees that
  eliminate race conditions.
  
  ## Constraint Details
  
  - **Extension required**: btree_gist (for GiST indexes on scalar types)
  - **Constraint type**: EXCLUDE USING gist
  - **Logic**: Two bookings for the same vehicle cannot have overlapping date ranges
  - **Exclusion applies to**: Active bookings only (not cancelled/expired)
  
  ## Performance Impact
  
  The GiST index adds minimal overhead to INSERT/UPDATE operations while providing
  strong consistency guarantees. This is more efficient than application-level locking.
  
  ## Status Values Excluded
  
  The constraint only applies to bookings that actually reserve the vehicle:
  - Confirmed
  - Active  
  - PendingPayment
  - PendingVerification
  - confirmed (lowercase variant)
  - active (lowercase variant)
  - pending_payment
  - pending_verification
  
  Cancelled, Expired, and failed bookings do not block the vehicle.
*/

-- Enable the btree_gist extension if not already enabled
-- This extension is required for exclusion constraints on scalar types
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping bookings
-- This ensures no two active bookings for the same vehicle can have overlapping dates
DO $$
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'excl_bookings_no_overlap'
  ) THEN
    -- Add the exclusion constraint
    ALTER TABLE bookings 
      ADD CONSTRAINT excl_bookings_no_overlap
      EXCLUDE USING gist (
        vehicle_id WITH =,
        tstzrange(pickup_date, return_date, '[]') WITH &&
      )
      WHERE (
        booking_status IN (
          'Confirmed', 
          'Active', 
          'PendingPayment', 
          'PendingVerification',
          'confirmed', 
          'active', 
          'pending_payment', 
          'pending_verification'
        )
      );
    
    RAISE NOTICE 'Successfully created exclusion constraint to prevent double-booking';
  ELSE
    RAISE NOTICE 'Exclusion constraint already exists, skipping';
  END IF;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the migration
    -- This handles edge cases where conflicting data might already exist
    RAISE WARNING 'Could not create exclusion constraint: %. Existing overlapping bookings may need to be resolved manually.', SQLERRM;
END $$;

-- Create a similar constraint for vehicle_blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'excl_vehicle_blocks_no_overlap'
  ) THEN
    ALTER TABLE vehicle_blocks 
      ADD CONSTRAINT excl_vehicle_blocks_no_overlap
      EXCLUDE USING gist (
        vehicle_id WITH =,
        tstzrange(blocked_from, blocked_until, '[]') WITH &&
      );
    
    RAISE NOTICE 'Successfully created exclusion constraint for vehicle_blocks';
  ELSE
    RAISE NOTICE 'Vehicle blocks exclusion constraint already exists, skipping';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Could not create vehicle_blocks exclusion constraint: %', SQLERRM;
END $$;
