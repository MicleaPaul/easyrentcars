/*
  # Add Test Mode Flag to Bookings

  1. Changes
    - Add `is_test_mode` boolean column to bookings table
    - Default value: false
    - Allows tracking of test bookings separately from payment method

  2. Purpose
    - Separate test mode flag from payment method
    - Preserve actual payment method (cash/stripe) even in test mode
    - Enable proper email/PDF display for test bookings with cash payment

  3. Notes
    - Existing test bookings can be identified by payment_method = 'test_mode'
    - New test bookings will have is_test_mode = true with real payment_method
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'is_test_mode'
  ) THEN
    ALTER TABLE bookings ADD COLUMN is_test_mode boolean DEFAULT false;
  END IF;
END $$;

-- Update existing test bookings to set the flag
UPDATE bookings
SET is_test_mode = true
WHERE payment_method = 'test_mode' OR notes LIKE '[TEST MODE]%';