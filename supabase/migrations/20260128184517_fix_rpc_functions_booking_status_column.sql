/*
  # Fix RPC Functions - Correct booking_status Column Name

  ## Changes Made

  1. **Fix check_vehicle_availability_rpc Function**
     - Replace `b.status` with `b.booking_status` (correct column name)
     - The bookings table uses `booking_status` column, not `status`

  2. **Fix get_available_vehicles_rpc Function**
     - Replace `b.status` with `b.booking_status` (correct column name)
     - Ensure consistency across both RPC functions

  ## Technical Details
     - Column name in bookings table: `booking_status` (text type)
     - Valid values: 'confirmed', 'pending', 'cancelled', etc.
*/

-- Fix check_vehicle_availability_rpc function
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
  SELECT EXISTS (
    SELECT 1 
    FROM bookings
    WHERE vehicle_id = p_vehicle_id
      AND booking_status IN ('confirmed', 'pending')
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

-- Fix get_available_vehicles_rpc function
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
        AND b.booking_status IN ('confirmed', 'pending')
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