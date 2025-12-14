/*
  # Add Custom Location Address Fields to Bookings

  1. Changes
    - Add `pickup_location_address` column to bookings table
      - Text field to store full address when custom pickup location is selected
      - Nullable since only used for custom locations
    - Add `return_location_address` column to bookings table
      - Text field to store full address when custom return location is selected
      - Nullable since only used for custom locations
    
  2. Purpose
    - Enable customers to specify exact addresses when selecting custom pickup/return locations
    - Support 20 euro custom location fee functionality with specific address tracking
    - Improve booking records with detailed location information for admin and customer reference
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'pickup_location_address'
  ) THEN
    ALTER TABLE bookings ADD COLUMN pickup_location_address TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'return_location_address'
  ) THEN
    ALTER TABLE bookings ADD COLUMN return_location_address TEXT;
  END IF;
END $$;