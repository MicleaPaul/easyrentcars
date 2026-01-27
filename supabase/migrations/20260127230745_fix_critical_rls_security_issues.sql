/*
  # Fix Critical RLS Security Issues
  
  This migration addresses critical security vulnerabilities in RLS policies:
  
  ## Changes Made
  
  ### 1. Secure checkout_holds table
  - **REMOVED**: Overly permissive policies that allowed anyone to INSERT/UPDATE/DELETE holds
  - **ADDED**: Restrictive policies that only allow edge functions to manage holds
  
  ### 2. Add customer access to bookings
  - **ADDED**: Policy allowing customers to view their own bookings by email
  
  ### 3. Prevent booking status manipulation
  - **UPDATED**: Booking INSERT policy to prevent status manipulation
  
  ## Security Impact
  - Prevents attackers from creating fake holds to block vehicles
  - Prevents attackers from deleting legitimate holds
  - Prevents users from viewing other customers' booking details
  - Prevents users from creating bookings with paid status
*/

-- Drop overly permissive checkout_holds policies
DROP POLICY IF EXISTS "System can create checkout holds" ON checkout_holds;
DROP POLICY IF EXISTS "System can update checkout holds" ON checkout_holds;
DROP POLICY IF EXISTS "System can delete checkout holds" ON checkout_holds;

-- Create secure checkout_holds policies
-- These policies block all direct client access
-- Only service role (used by edge functions) can bypass RLS

CREATE POLICY "Block direct client access to holds"
  ON checkout_holds
  FOR ALL
  TO anon, authenticated
  USING (false);

-- Add policy for customers to view their own bookings
CREATE POLICY "Customers can view own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Update booking INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;

CREATE POLICY "Users can create pending bookings"
  ON bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Must start with pending payment status (or NULL which defaults to pending)
    (payment_status = 'pending' OR payment_status IS NULL)
    AND
    -- Must start with proper pending booking status
    (booking_status IN ('pending_payment', 'PendingPayment', 'pending_verification', 'PendingVerification'))
    AND
    -- Cannot set payment_received to true on creation
    (payment_received = false OR payment_received IS NULL)
    AND
    -- Cannot mark email as verified on creation
    (email_verified_at IS NULL)
    AND
    -- Cannot mark card as verified on creation
    (card_verified_at IS NULL)
  );
