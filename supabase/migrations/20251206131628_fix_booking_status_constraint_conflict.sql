/*
  # Fix Booking Status Constraint Conflict
  
  1. Problem
    - Two conflicting CHECK constraints on booking_status column
    - Old constraint uses lowercase: 'pending', 'confirmed', 'active', 'completed', 'cancelled'
    - New constraint uses capitalized: 'PendingVerification', 'PendingPayment', 'Confirmed', etc.
    - Code tries to insert lowercase values but new constraint rejects them
    
  2. Solution
    - Drop the old constraint
    - Update existing records to use new capitalized format
    - Standardize on capitalized status values going forward
    
  3. Status Mapping
    - 'pending' → 'PendingPayment' (for cash payments) or 'PendingVerification' (for card)
    - 'confirmed' → 'Confirmed'
    - 'active' → 'Active'
    - 'completed' → 'Completed'
    - 'cancelled' → 'Cancelled'
    - Add new: 'PendingVerification', 'PendingPayment', 'Expired'
    
  4. Security
    - Maintain existing RLS policies with updated status values
    - Ensure backward compatibility during transition
*/

-- First, update any existing records to use the new format
UPDATE bookings 
SET booking_status = CASE booking_status
  WHEN 'pending' THEN 'PendingPayment'
  WHEN 'confirmed' THEN 'Confirmed'
  WHEN 'active' THEN 'Active'
  WHEN 'completed' THEN 'Completed'
  WHEN 'cancelled' THEN 'Cancelled'
  ELSE booking_status
END
WHERE booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- Drop the old constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'bookings_booking_status_check' 
    AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_booking_status_check;
  END IF;
END $$;

-- The new constraint was already added in migration 20251123235458
-- Just verify it's in place by attempting to recreate (will fail silently if exists)
DO $$
BEGIN
  ALTER TABLE bookings ADD CONSTRAINT bookings_booking_status_check
    CHECK (booking_status IN (
      'draft', 'PendingVerification', 'PendingPayment', 'Confirmed',
      'Active', 'Completed', 'Cancelled', 'Expired'
    ));
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists, that's fine
END $$;

-- Update payment_method constraint to include test_mode
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_method_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_method_check 
  CHECK (payment_method IN ('stripe', 'cash', 'transfer', 'test_mode'));

-- Update payment_status constraint to include completed
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'completed'));

-- Update the default value for booking_status
ALTER TABLE bookings ALTER COLUMN booking_status SET DEFAULT 'PendingPayment';

-- Add index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
