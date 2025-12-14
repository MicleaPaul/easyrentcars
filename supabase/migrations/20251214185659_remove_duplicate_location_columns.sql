/*
  # Remove Duplicate Location Address Columns

  1. Changes
    - Drop `pickup_custom_address` column from bookings table
      - This is a duplicate of `pickup_location_address` created earlier
      - All code now uses the correct `pickup_location_address` column
    - Drop `return_custom_address` column from bookings table
      - This is a duplicate of `return_location_address` created earlier
      - All code now uses the correct `return_location_address` column

  2. Background
    - Migration 20251116020039 created `pickup_location_address` and `return_location_address`
    - Migration 20251123190348 accidentally created duplicate columns with different names
    - This cleanup migration removes the duplicate columns to prevent confusion

  3. Impact
    - No data loss - the duplicate columns were never populated
    - Code has been updated to use the correct column names
    - Improves database schema clarity and maintainability
*/

DO $$
BEGIN
  -- Drop pickup_custom_address if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'pickup_custom_address'
  ) THEN
    ALTER TABLE bookings DROP COLUMN pickup_custom_address;
  END IF;

  -- Drop return_custom_address if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'return_custom_address'
  ) THEN
    ALTER TABLE bookings DROP COLUMN return_custom_address;
  END IF;
END $$;