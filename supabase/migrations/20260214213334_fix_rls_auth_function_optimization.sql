/*
  # Fix RLS Auth Function Optimization

  Wraps bare `auth.uid()` calls in RLS policies with `(select auth.uid())`
  so PostgreSQL evaluates the function once per query instead of once per row.

  1. Affected Tables and Policies
    - `inquiries`: "Admins can delete inquiries", "Admins can read all inquiries", "Admins can update inquiries"
    - `privacy_policy`: "Admins can view all privacy policy", "Admins can insert privacy policy", "Admins can update privacy policy", "Admins can delete privacy policy"
    - `booking_attempts`: "Admins can view booking attempts"
    - `bookings`: "Customers can view own bookings"
    - `vehicles`: "Admins can view all vehicles"
    - `stripe_webhook_logs`: "Admins can read webhook logs"

  2. Security
    - No access changes; only performance optimization
    - All policies retain their original logic and role restrictions
*/

-- inquiries: "Admins can delete inquiries"
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
CREATE POLICY "Admins can delete inquiries"
  ON public.inquiries FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- inquiries: "Admins can read all inquiries"
DROP POLICY IF EXISTS "Admins can read all inquiries" ON public.inquiries;
CREATE POLICY "Admins can read all inquiries"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- inquiries: "Admins can update inquiries"
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries"
  ON public.inquiries FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- privacy_policy: "Admins can view all privacy policy"
DROP POLICY IF EXISTS "Admins can view all privacy policy" ON public.privacy_policy;
CREATE POLICY "Admins can view all privacy policy"
  ON public.privacy_policy FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- privacy_policy: "Admins can insert privacy policy"
DROP POLICY IF EXISTS "Admins can insert privacy policy" ON public.privacy_policy;
CREATE POLICY "Admins can insert privacy policy"
  ON public.privacy_policy FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- privacy_policy: "Admins can update privacy policy"
DROP POLICY IF EXISTS "Admins can update privacy policy" ON public.privacy_policy;
CREATE POLICY "Admins can update privacy policy"
  ON public.privacy_policy FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- privacy_policy: "Admins can delete privacy policy"
DROP POLICY IF EXISTS "Admins can delete privacy policy" ON public.privacy_policy;
CREATE POLICY "Admins can delete privacy policy"
  ON public.privacy_policy FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- booking_attempts: "Admins can view booking attempts"
DROP POLICY IF EXISTS "Admins can view booking attempts" ON public.booking_attempts;
CREATE POLICY "Admins can view booking attempts"
  ON public.booking_attempts FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- bookings: "Customers can view own bookings"
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    customer_email = ((SELECT users.email FROM auth.users WHERE users.id = (select auth.uid())))::text
    OR EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
    )
  );

-- vehicles: "Admins can view all vehicles"
DROP POLICY IF EXISTS "Admins can view all vehicles" ON public.vehicles;
CREATE POLICY "Admins can view all vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- stripe_webhook_logs: "Admins can read webhook logs"
DROP POLICY IF EXISTS "Admins can read webhook logs" ON public.stripe_webhook_logs;
CREATE POLICY "Admins can read webhook logs"
  ON public.stripe_webhook_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));
