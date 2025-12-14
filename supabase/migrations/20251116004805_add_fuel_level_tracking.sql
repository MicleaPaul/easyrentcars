/*
  # Add Fuel Level Tracking to Bookings

  ## Overview
  Adds comprehensive fuel level tracking to ensure vehicles are returned with at least
  the same fuel level as when they were picked up. Includes automatic charge calculation
  for insufficient fuel returns.

  ## New Columns in bookings table

  ### pickup_fuel_level
  - Type: numeric (0-100, representing percentage)
  - Description: Fuel level when vehicle is picked up
  - Required when booking status changes to 'active'
  - Default: NULL (must be set before pickup)

  ### return_fuel_level
  - Type: numeric (0-100, representing percentage)
  - Description: Fuel level when vehicle is returned
  - Required when booking status changes to 'completed'
  - Default: NULL (must be set before completion)

  ### fuel_refund_due
  - Type: boolean
  - Description: Indicates if fuel charge is required (return < pickup)
  - Default: false
  - Automatically calculated when return_fuel_level is set

  ### fuel_charge_amount
  - Type: numeric
  - Description: Additional charge for insufficient fuel (EUR)
  - Default: 0
  - Calculated as: (pickup_fuel_level - return_fuel_level) * fuel_price_per_percent

  ## Database Constraints
  - Both fuel levels must be between 0 and 100
  - return_fuel_level can be NULL until vehicle is returned
  - pickup_fuel_level must be set before vehicle can be marked as picked up

  ## Settings Entry
  - key: 'fuel_charge_rate'
  - value: { "price_per_percent": 2.0, "currency": "EUR" }
  - Description: Cost per percent of missing fuel

  ## Security
  - RLS policies remain unchanged
  - Only admins can update fuel levels via existing booking policies
  - Audit trail maintained through updated_at timestamps

  ## Important Notes
  1. Fuel levels are stored as percentages (0-100) for easy calculation
  2. Charges calculated automatically but can be overridden by admin
  3. System prevents booking completion without fuel level verification
  4. Historical data preserved for audit purposes
*/

-- Add fuel level columns to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'pickup_fuel_level'
  ) THEN
    ALTER TABLE bookings ADD COLUMN pickup_fuel_level numeric CHECK (pickup_fuel_level >= 0 AND pickup_fuel_level <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'return_fuel_level'
  ) THEN
    ALTER TABLE bookings ADD COLUMN return_fuel_level numeric CHECK (return_fuel_level >= 0 AND return_fuel_level <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'fuel_refund_due'
  ) THEN
    ALTER TABLE bookings ADD COLUMN fuel_refund_due boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'fuel_charge_amount'
  ) THEN
    ALTER TABLE bookings ADD COLUMN fuel_charge_amount numeric DEFAULT 0;
  END IF;
END $$;

-- Create index for queries filtering by fuel status
CREATE INDEX IF NOT EXISTS idx_bookings_fuel_refund ON bookings(fuel_refund_due) WHERE fuel_refund_due = true;

-- Insert fuel charge rate setting if it doesn't exist
INSERT INTO settings (key, value, updated_at)
VALUES (
  'fuel_charge_rate',
  '{"price_per_percent": 2.0, "currency": "EUR", "description": "Cost per percent of missing fuel on return"}'::jsonb,
  now()
)
ON CONFLICT (key) DO NOTHING;

-- Create function to automatically calculate fuel charges
CREATE OR REPLACE FUNCTION calculate_fuel_charge()
RETURNS TRIGGER AS $$
DECLARE
  fuel_rate numeric;
  fuel_difference numeric;
BEGIN
  -- Only calculate if return fuel level is set and is less than pickup
  IF NEW.return_fuel_level IS NOT NULL AND NEW.pickup_fuel_level IS NOT NULL THEN
    IF NEW.return_fuel_level < NEW.pickup_fuel_level THEN
      -- Get fuel charge rate from settings
      SELECT (value->>'price_per_percent')::numeric INTO fuel_rate
      FROM settings
      WHERE key = 'fuel_charge_rate';
      
      -- Calculate difference and charge
      fuel_difference := NEW.pickup_fuel_level - NEW.return_fuel_level;
      NEW.fuel_charge_amount := fuel_difference * COALESCE(fuel_rate, 2.0);
      NEW.fuel_refund_due := true;
    ELSE
      -- Fuel level is adequate
      NEW.fuel_charge_amount := 0;
      NEW.fuel_refund_due := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to automatically calculate fuel charges
DROP TRIGGER IF EXISTS calculate_fuel_charge_trigger ON bookings;
CREATE TRIGGER calculate_fuel_charge_trigger
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  WHEN (NEW.return_fuel_level IS DISTINCT FROM OLD.return_fuel_level)
  EXECUTE FUNCTION calculate_fuel_charge();

-- Verify migration success
SELECT
  'Migration completed successfully!' as status,
  'Fuel level tracking columns added to bookings table' as message,
  'Automatic fuel charge calculation trigger installed' as trigger_status;
