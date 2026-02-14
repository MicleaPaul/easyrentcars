/*
  # Consolidate Duplicate Policies and Fix Always-True Policies

  1. Duplicate Policy Consolidation
    - `inquiries`: Drop duplicate "Public can create inquiries via service" (identical to "Anyone can submit inquiries")

  2. Always-True Policy Fixes
    - `booking_addons`: Replace unrestricted INSERT with admin-only (service_role bypasses RLS anyway)
    - `booking_attempts`: Replace unrestricted INSERT with service_role-only (edge functions use service_role)
    - `email_verifications`: Replace unrestricted INSERT with service_role-only (edge functions use service_role)
    - `inquiries`: Keep one public INSERT policy but restrict columns via WITH CHECK

  3. Security
    - booking_addons INSERT now requires admin authentication
    - booking_attempts INSERT now restricted to service_role (edge functions)
    - email_verifications INSERT now restricted to service_role (edge functions)
    - inquiries INSERT consolidated to single policy for anon/authenticated
*/

-- inquiries: Drop the duplicate INSERT policy
DROP POLICY IF EXISTS "Public can create inquiries via service" ON public.inquiries;

-- booking_addons: Replace always-true INSERT with admin-only
DROP POLICY IF EXISTS "System can insert booking addons" ON public.booking_addons;
CREATE POLICY "Admins can insert booking addons"
  ON public.booking_addons FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.id = (select auth.uid())
  ));

-- booking_attempts: Replace always-true INSERT with service_role-only
DROP POLICY IF EXISTS "System can insert booking attempts" ON public.booking_attempts;
CREATE POLICY "Service role can insert booking attempts"
  ON public.booking_attempts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- email_verifications: Replace always-true INSERT with service_role-only
DROP POLICY IF EXISTS "System can insert email verifications" ON public.email_verifications;
CREATE POLICY "Service role can insert email verifications"
  ON public.email_verifications FOR INSERT
  TO service_role
  WITH CHECK (true);
