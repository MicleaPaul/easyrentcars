/*
  # Fix Function Search Path Security Issues

  This migration addresses the "Function Search Path Mutable" security warnings
  by setting explicit search paths for all affected database functions.

  ## Changes Made
  
  1. **update_vehicle_blocks_updated_at** function
     - Sets search_path to `public, pg_temp` to prevent search_path injection attacks
     
  2. **calculate_fraud_score** function
     - Sets search_path to `public, pg_temp` to ensure only intended schemas are accessed
     
  3. **expire_old_bookings** function
     - Sets search_path to `public, pg_temp` to secure against potential exploits
     
  4. **check_rate_limit** function
     - Sets search_path to `public, pg_temp` to prevent unauthorized schema access

  ## Security Impact
  
  These changes protect the database from search_path injection attacks where
  malicious users could potentially manipulate the search_path to access or
  modify data in unintended schemas.
*/

-- Drop and recreate update_vehicle_blocks_updated_at function with secure search_path
DROP FUNCTION IF EXISTS public.update_vehicle_blocks_updated_at() CASCADE;

CREATE FUNCTION public.update_vehicle_blocks_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_vehicle_blocks_updated_at ON vehicle_blocks;
CREATE TRIGGER update_vehicle_blocks_updated_at
  BEFORE UPDATE ON vehicle_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_blocks_updated_at();

-- Drop and recreate calculate_fraud_score function with secure search_path
DROP FUNCTION IF EXISTS public.calculate_fraud_score(text, text, text);

CREATE FUNCTION public.calculate_fraud_score(
  p_email text,
  p_phone text,
  p_ip_address text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_score integer := 0;
  v_email_count integer;
  v_phone_count integer;
  v_ip_count integer;
BEGIN
  -- Check email usage in last 30 days
  SELECT COUNT(*) INTO v_email_count
  FROM bookings
  WHERE email = p_email
    AND created_at > now() - interval '30 days';
  
  IF v_email_count > 5 THEN
    v_score := v_score + 30;
  ELSIF v_email_count > 3 THEN
    v_score := v_score + 15;
  END IF;

  -- Check phone usage in last 30 days
  SELECT COUNT(*) INTO v_phone_count
  FROM bookings
  WHERE phone = p_phone
    AND created_at > now() - interval '30 days';
  
  IF v_phone_count > 5 THEN
    v_score := v_score + 30;
  ELSIF v_phone_count > 3 THEN
    v_score := v_score + 15;
  END IF;

  -- Check IP usage in last 24 hours
  SELECT COUNT(*) INTO v_ip_count
  FROM bookings
  WHERE ip_address = p_ip_address
    AND created_at > now() - interval '24 hours';
  
  IF v_ip_count > 3 THEN
    v_score := v_score + 40;
  ELSIF v_ip_count > 1 THEN
    v_score := v_score + 20;
  END IF;

  RETURN v_score;
END;
$$;

-- Drop and recreate expire_old_bookings function with secure search_path
DROP FUNCTION IF EXISTS public.expire_old_bookings();

CREATE FUNCTION public.expire_old_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE bookings
  SET status = 'expired'
  WHERE status = 'pending'
    AND created_at < now() - interval '15 minutes';
END;
$$;

-- Drop and recreate check_rate_limit function with secure search_path
DROP FUNCTION IF EXISTS public.check_rate_limit(text, integer, interval);

CREATE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_limit integer,
  p_window interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM bookings
  WHERE (email = p_identifier OR ip_address = p_identifier)
    AND created_at > now() - p_window;
  
  RETURN v_count < p_limit;
END;
$$;