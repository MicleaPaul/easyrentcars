/*
  # Add Price Component Columns to Bookings

  1. Changes
    - Add `rental_cost` column to store the base rental cost (days × price_per_day)
    - Add `unlimited_km_fee` column to store the unlimited kilometers fee
    - These columns will store the calculated values at booking time to ensure consistency
    - This prevents recalculation errors in emails and PDFs

  2. Notes
    - All new columns are nullable to support existing bookings
    - Default value is 0 for numeric columns
    - These values will be calculated and stored when the booking is created
*/

DO $$
BEGIN
  -- Add rental_cost column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'rental_cost'
  ) THEN
    ALTER TABLE bookings ADD COLUMN rental_cost numeric DEFAULT 0;
  END IF;

  -- Add unlimited_km_fee column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'unlimited_km_fee'
  ) THEN
    ALTER TABLE bookings ADD COLUMN unlimited_km_fee numeric DEFAULT 0;
  END IF;
END $$;