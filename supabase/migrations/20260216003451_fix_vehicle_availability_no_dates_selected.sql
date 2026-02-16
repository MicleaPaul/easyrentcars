/*
  # Fix vehicle availability when no dates selected

  1. Changes
    - Modified `get_available_vehicles_rpc` function to show ALL available vehicles when no dates are provided
    - Previously, when no dates were selected, the function defaulted to checking NOW() to NOW() + 1 day
    - This caused vehicles booked for short periods (e.g., tonight 7-7:30 PM) to disappear entirely from the listing
    - Now, when both dates are NULL, all vehicles with status 'available' are returned regardless of bookings
    - Time-based availability filtering only applies when the user explicitly selects dates

  2. Impact
    - Vehicles will always appear in the fleet listing unless the user searches for specific dates that conflict
    - A vehicle booked for tonight will still show up in the general listing
    - Users can still check specific date availability by selecting dates in the search form
*/

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
  v_available_vehicles uuid[];
BEGIN
  IF p_pickup_date IS NULL OR p_return_date IS NULL THEN
    SELECT ARRAY_AGG(v.id)
    INTO v_available_vehicles
    FROM vehicles v
    WHERE v.status = 'available';

    RETURN COALESCE(v_available_vehicles, ARRAY[]::uuid[]);
  END IF;

  IF p_return_date <= p_pickup_date THEN
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
          p_return_date <= b.pickup_date OR
          p_pickup_date >= b.return_date
        )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM vehicle_blocks vb
      WHERE vb.vehicle_id = v.id
        AND NOT (
          p_return_date <= vb.blocked_from OR
          p_pickup_date >= vb.blocked_until
        )
    );

  RETURN COALESCE(v_available_vehicles, ARRAY[]::uuid[]);
END;
$$;
