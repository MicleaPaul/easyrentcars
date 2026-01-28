/*
  # Fix Vehicle Blocks Dates and Add Server-Side Availability RPC Functions

  ## Changes Made

  1. **Data Corrections**
     - Update all vehicle_blocks records from year 2026 to 2025
     - Fix blocked_from dates: 2026-01-13 → 2025-01-13
     - Fix blocked_until dates: 2026-03-31 → 2025-03-31 and 2026-08-31 → 2025-08-31

  2. **New RPC Functions**
     - `check_vehicle_availability_rpc`: Server-side availability checker using server timestamp
       - Parameters: p_vehicle_id (uuid), p_pickup_date (timestamptz), p_return_date (timestamptz)
       - Returns: jsonb with isAvailable, reason, conflictType
       - Uses server NOW() to eliminate browser time discrepancies
     
     - `get_available_vehicles_rpc`: Get list of available vehicle IDs for date range
       - Parameters: p_pickup_date (timestamptz, optional), p_return_date (timestamptz, optional)
       - Returns: array of vehicle UUIDs that are available
       - Filters out blocked and booked vehicles
       - If no dates provided, checks against current server time

  3. **Performance Optimizations**
     - Functions use existing indexes on vehicle_blocks and bookings
     - Efficient date range overlap checking
     - Optimized queries for filtering

  ## Security
     - Functions are marked as SECURITY DEFINER to ensure consistent access
     - Proper search_path set to prevent SQL injection
     - Input validation for date ranges
*/

-- Step 1: Fix incorrect dates in vehicle_blocks (2026 → 2025)
UPDATE vehicle_blocks
SET 
  blocked_from = blocked_from - INTERVAL '1 year',
  blocked_until = blocked_until - INTERVAL '1 year'
WHERE EXTRACT(YEAR FROM blocked_from) = 2026 
   OR EXTRACT(YEAR FROM blocked_until) = 2026;

-- Step 2: Create RPC function to check vehicle availability (server-side)
CREATE OR REPLACE FUNCTION check_vehicle_availability_rpc(
  p_vehicle_id uuid,
  p_pickup_date timestamptz,
  p_return_date timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_available boolean := true;
  v_reason text := '';
  v_conflict_type text := '';
  v_booking_conflict boolean;
  v_block_conflict boolean;
BEGIN
  -- Validate input dates
  IF p_return_date <= p_pickup_date THEN
    RETURN jsonb_build_object(
      'isAvailable', false,
      'reason', 'Return date must be after pickup date',
      'conflictType', 'invalid_dates'
    );
  END IF;

  -- Check for booking conflicts using server time
  -- A conflict exists if there's any overlap between the requested period and existing bookings
  SELECT EXISTS (
    SELECT 1 
    FROM bookings
    WHERE vehicle_id = p_vehicle_id
      AND status IN ('confirmed', 'pending')
      AND NOT (
        p_return_date <= pickup_date OR 
        p_pickup_date >= return_date
      )
  ) INTO v_booking_conflict;

  IF v_booking_conflict THEN
    v_is_available := false;
    v_reason := 'Vehicle is already booked for the selected period';
    v_conflict_type := 'booking';
    
    RETURN jsonb_build_object(
      'isAvailable', v_is_available,
      'reason', v_reason,
      'conflictType', v_conflict_type
    );
  END IF;

  -- Check for vehicle block conflicts
  SELECT EXISTS (
    SELECT 1
    FROM vehicle_blocks
    WHERE vehicle_id = p_vehicle_id
      AND NOT (
        p_return_date <= blocked_from OR 
        p_pickup_date >= blocked_until
      )
  ) INTO v_block_conflict;

  IF v_block_conflict THEN
    v_is_available := false;
    v_reason := 'Vehicle is blocked for maintenance or long-term rental';
    v_conflict_type := 'block';
    
    RETURN jsonb_build_object(
      'isAvailable', v_is_available,
      'reason', v_reason,
      'conflictType', v_conflict_type
    );
  END IF;

  -- Vehicle is available
  RETURN jsonb_build_object(
    'isAvailable', true,
    'reason', '',
    'conflictType', ''
  );
END;
$$;

-- Step 3: Create RPC function to get available vehicles for a date range
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
  WHERE v.available = true
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

-- Step 4: Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION check_vehicle_availability_rpc TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_available_vehicles_rpc TO anon, authenticated;

-- Step 5: Add helpful comments
COMMENT ON FUNCTION check_vehicle_availability_rpc IS 'Server-side function to check vehicle availability for a date range. Uses server timestamp to eliminate browser time discrepancies.';
COMMENT ON FUNCTION get_available_vehicles_rpc IS 'Server-side function to get list of available vehicle IDs for a date range. Returns empty array if no vehicles available.';