/*
  # Update Minimum Rental Age to 25 Years

  1. Changes
    - Update default value for minimum_age column to 25 years
    - Update all existing vehicle records to set minimum_age to 25
    - Ensures consistent minimum age requirement across all vehicles

  2. Business Rules
    - All vehicles now require renters to be at least 25 years old
    - This applies to all vehicle categories (Economy, Standard, Premium, Luxury)
    - This aligns with the company's insurance and risk management policies

  3. Security
    - No changes to RLS policies
    - Maintains existing access controls
*/

-- Update all existing vehicles to have minimum_age of 25
UPDATE vehicles
SET minimum_age = 25
WHERE minimum_age IS NOT NULL AND minimum_age != 25;

-- Ensure the default value for the minimum_age column is set to 25
ALTER TABLE vehicles
ALTER COLUMN minimum_age SET DEFAULT 25;