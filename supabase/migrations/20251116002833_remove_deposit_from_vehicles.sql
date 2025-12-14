/*
  # Remove Deposit System from Vehicle Rentals

  This migration eliminates the deposit concept from the rental system to provide
  transparent, simple pricing where customers only pay: days x price_per_day = total.

  ## Changes Made

  1. **Vehicles Table**
     - Remove `deposit` column entirely
     - All pricing now based solely on `price_per_day`

  2. **Settings Table**
     - Remove `deposit_amount` from rental_rules settings if it exists

  ## Impact

  - Existing vehicles will no longer have deposit information
  - Price calculations simplified: rental_days x price_per_day only
  - Example: 2 days x EUR74 = EUR148 (instead of EUR148 + EUR700 deposit = EUR848)

  ## Security

  - Maintains all existing RLS policies
  - No changes to access control
*/

-- Remove deposit column from vehicles table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'deposit'
  ) THEN
    ALTER TABLE vehicles DROP COLUMN deposit;
  END IF;
END $$;

-- Update settings to remove deposit_amount from rental_rules if it exists
UPDATE settings
SET value = value - 'deposit_amount'
WHERE key = 'rental_rules' AND value ? 'deposit_amount';
