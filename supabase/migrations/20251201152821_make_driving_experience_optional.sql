/*
  # Make driving_experience optional in bookings table

  1. Changes
    - Alter `driving_experience` column in `bookings` table to be nullable
    - This allows new bookings to be created without providing driving experience
    
  2. Notes
    - Existing bookings with driving_experience data will remain unchanged
    - New bookings can have NULL for driving_experience
    - This is a safe, non-destructive change
*/

-- Make driving_experience nullable
ALTER TABLE bookings 
ALTER COLUMN driving_experience DROP NOT NULL;
