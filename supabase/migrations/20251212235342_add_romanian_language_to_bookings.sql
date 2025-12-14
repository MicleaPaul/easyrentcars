/*
  # Add Romanian Language Support to Bookings Table

  1. Changes
    - Drop existing language check constraint on bookings table
    - Add new language check constraint that includes Romanian ('ro')
    - This fixes the error when creating bookings with Romanian language selected
  
  2. Affected Table
    - `bookings` table
      - Updated language constraint to include: 'de', 'en', 'fr', 'it', 'es', 'ro'
  
  3. Security
    - No changes to RLS policies needed
    - Only updates the check constraint to allow Romanian language
  
  4. Notes
    - The application already has full Romanian translations
    - FAQs and Terms tables already support Romanian with separate columns
    - This brings the bookings table in line with the rest of the application
*/

-- Drop the existing language check constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_language_check;

-- Add new language check constraint that includes Romanian
ALTER TABLE bookings 
ADD CONSTRAINT bookings_language_check 
CHECK (language IN ('de', 'en', 'fr', 'it', 'es', 'ro'));
