/*
  # Fix Email Verifications Token Enumeration Vulnerability
  
  ## Security Issue
  The "Users can verify with valid token" policy allowed anyone to SELECT all valid 
  tokens from the email_verifications table by querying:
  ```
  SELECT * FROM email_verifications 
  WHERE verified_at IS NULL AND expires_at > now()
  ```
  
  This exposed all active verification tokens and associated booking data.
  
  ## Changes Made
  
  1. **REMOVED**: Policy allowing public SELECT of unverified tokens
  2. **SECURITY**: Only admins and service role (edge functions) can now access tokens
  
  ## Impact
  - Prevents token enumeration attacks
  - Token verification still works via verify-email-token edge function (uses service role)
  - Admins can still view all verifications for support purposes
*/

-- Drop the vulnerable policy that allows users to enumerate tokens
DROP POLICY IF EXISTS "Users can verify with valid token" ON email_verifications;

-- No replacement policy needed - edge functions use service role key which bypasses RLS
-- Only admins need SELECT access, which they already have via "Admins can view all email verifications"
