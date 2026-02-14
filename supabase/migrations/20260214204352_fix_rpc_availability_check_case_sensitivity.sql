/*
  # Fix RPC availability check case-sensitivity bug

  1. Changes
    - Fix `check_vehicle_availability_rpc` function: change lowercase booking_status
      values ('confirmed', 'pending') to correct PascalCase values matching the
      CHECK constraint ('Confirmed', 'Active', 'PendingPayment', 'PendingVerification')
    - Fix `get_available_vehicles_rpc` function: same case-sensitivity fix
    
  2. Impact
    - Previously, both functions NEVER detected booking conflicts because they
      compared against lowercase values while the DB only stores PascalCase values
    - After this fix, double-booking prevention on the frontend will work correctly

  3. Important Notes
    - The bookings table CHECK constraint only allows PascalCase values:
      'draft', 'PendingVerification', 'PendingPayment', 'Confirmed', 'Active',
      'Completed', 'Cancelled', 'Expired'
    - PostgreSQL text comparison is case-sensitive
*/

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
  IF p_return_date <= p_pickup_date THEN
    RETURN jsonb_build_object(
      'isAvailable', false,
      'reason', 'Return date must be after pickup date',
      'conflictType', 'invalid_dates'
    );
  END IF;

  SELECT EXISTS (
    SELECT 1 
    FROM bookings
    WHERE vehicle_id = p_vehicle_id
      AND booking_status IN ('Confirmed', 'Active', 'PendingPayment', 'PendingVerification')
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

  RETURN jsonb_build_object(
    'isAvailable', true,
    'reason', '',
    'conflictType', ''
  );
END;
$$;

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
  v_pickup_date := COALESCE(p_pickup_date, NOW());
  v_return_date := COALESCE(p_return_date, NOW() + INTERVAL '1 day');

  IF v_return_date <= v_pickup_date THEN
    RETURN ARRAY[]::uuid[];
  END IF;

  SELECT ARRAY_AGG(v.id)
  INTO v_available_vehicles
  FROM vehicles v
  WHERE v.status = 'available'
    AND NOT EXISTS (
      SELECT 1 
      FROM bookings b
      WHERE b.vehicle_id = v.id
        AND b.booking_status IN ('Confirmed', 'Active', 'PendingPayment', 'PendingVerification')
        AND NOT (
          v_return_date <= b.pickup_date OR 
          v_pickup_date >= b.return_date
        )
    )
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
