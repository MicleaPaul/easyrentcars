/*
  # Add Cleaning Fee to Bookings

  1. Changes
    - Add `cleaning_fee` column to `bookings` table
      - Type: NUMERIC (to store decimal values like 7.00)
      - Default: 7 (standard cleaning fee of €7)
      - NOT NULL: Yes (always charged)
  
  2. Notes
    - Cleaning fee is a one-time charge per booking, not per day
    - Default value of €7 will be applied to all new bookings
    - Existing bookings will also get the default value
*/

-- Add cleaning_fee column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'cleaning_fee'
  ) THEN
    ALTER TABLE bookings ADD COLUMN cleaning_fee NUMERIC NOT NULL DEFAULT 7;
  END IF;
END $$;