/*
  # Move btree_gist Extension Out of Public Schema

  1. Changes
    - Create `extensions` schema if it doesn't exist
    - Temporarily drop exclusion constraints that depend on btree_gist
    - Move `btree_gist` extension from `public` to `extensions` schema
    - Recreate the exclusion constraints

  2. Affected Constraints
    - `excl_bookings_no_overlap` on `bookings` - prevents double-booking
    - `excl_vehicle_blocks_no_overlap` on `vehicle_blocks` - prevents overlapping blocks

  3. Important Notes
    - Constraints are dropped and immediately recreated in the same transaction
    - No data integrity window since this runs as a single migration
*/

CREATE SCHEMA IF NOT EXISTS extensions;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS excl_bookings_no_overlap;
ALTER TABLE public.vehicle_blocks DROP CONSTRAINT IF EXISTS excl_vehicle_blocks_no_overlap;

DROP EXTENSION IF EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;

ALTER TABLE public.bookings
  ADD CONSTRAINT excl_bookings_no_overlap
  EXCLUDE USING gist (
    vehicle_id WITH =,
    tstzrange(pickup_date, return_date, '[]') WITH &&
  )
  WHERE (booking_status = ANY (ARRAY[
    'Confirmed', 'Active', 'PendingPayment', 'PendingVerification',
    'confirmed', 'active', 'pending_payment', 'pending_verification'
  ]));

ALTER TABLE public.vehicle_blocks
  ADD CONSTRAINT excl_vehicle_blocks_no_overlap
  EXCLUDE USING gist (
    vehicle_id WITH =,
    tstzrange(blocked_from, blocked_until, '[]') WITH &&
  );
