/*
  # Fix get_available_vehicles_rpc Function - Correct Status Column

  ## Changes Made

  1. **Fix get_available_vehicles_rpc Function**
     - Replace incorrect `v.available = true` with `v.status = 'available'`
     - The vehicles table uses `status` column, not `available` column
     - Function now correctly filters vehicles by status

  ## Technical Details
     - Column name: `status` (text type)
     - Valid status value: 'available'
*/

-- Drop and recreate the function with correct column reference
CREATE OR REPLACE FUNCTION get_available_vehicles_rpc(
  p_pickup_date timestamptz DEFAULT NULL,
  p_return_date timestamptz DEFAULT NULL
)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pickup_date timestamptz;
  v_return_date timestamptz;
  v_available_vehicles uuid[];
BEGIN
  -- Use provided dates or default to now
  v_pickup_date := COALESCE(p_pickup_date, NOW());
  v_return_date := COALESCE(p_return_date, NOW() + INTERVAL '1 day');

  -- Validate dates
  IF v_return_date <= v_pickup_date THEN
    RETURN ARRAY[]::uuid[];
  END IF;

  -- Get all vehicle IDs that are NOT blocked or booked for the specified period
  SELECT ARRAY_AGG(v.id)
  INTO v_available_vehicles
  FROM vehicles v
  WHERE v.status = 'available'
    -- Exclude vehicles that have booking conflicts
    AND NOT EXISTS (
      SELECT 1 
      FROM bookings b
      WHERE b.vehicle_id = v.id
        AND b.status IN ('confirmed', 'pending')
        AND NOT (
          v_return_date <= b.pickup_date OR 
          v_pickup_date >= b.return_date
        )
    )
    -- Exclude vehicles that have block conflicts
    AND NOT EXISTS (
      SELECT 1
      FROM vehicle_blocks vb
      WHERE vb.vehicle_id = v.id
        AND NOT (
          v_return_date <= vb.blocked_from OR 
          v_pickup_date >= vb.blocked_until
        )
    );

  RETURN COALESCE(v_available_vehicles, ARRAY[]::uuid[]);
END;
$$;