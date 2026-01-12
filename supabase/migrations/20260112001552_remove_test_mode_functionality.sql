/*
  # Remove Test Mode Functionality

  1. Changes
    - Delete the test_mode setting from site_settings table
    - Drop the is_test_mode column from bookings table
    
  2. Security
    - No RLS changes needed, just removing test-only data
    
  3. Notes
    - This permanently removes the test mode feature
    - Test mode bookings will remain but without the is_test_mode marker
*/

-- Remove test_mode setting from site_settings
DELETE FROM site_settings WHERE key = 'test_mode';

-- Remove is_test_mode column from bookings
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'is_test_mode'
  ) THEN
    ALTER TABLE bookings DROP COLUMN is_test_mode;
  END IF;
END $$;
