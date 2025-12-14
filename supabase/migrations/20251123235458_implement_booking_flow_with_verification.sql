/*
  # Implement Complete Booking Flow with Card Verification and Anti-Fraud Protection

  This migration implements a professional booking system with multi-stage verification.
*/

-- Update existing bookings to new status format
UPDATE bookings SET booking_status = 'PendingPayment' WHERE booking_status = 'pending';

-- Add new constraint with new status values
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_status_check
  CHECK (booking_status IN (
    'draft', 'PendingVerification', 'PendingPayment', 'Confirmed',
    'Active', 'Completed', 'Cancelled', 'Expired'
  ));

-- Add new columns for Stripe SetupIntent and verification
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_setup_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method_choice TEXT CHECK (payment_method_choice IN ('cash', 'card', 'transfer'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_received BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS card_verified_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS captcha_token TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fraud_score INT DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status_dates ON bookings(booking_status, pickup_date, return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_setup_intent ON bookings(stripe_setup_intent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_fingerprint ON bookings(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_bookings_ip ON bookings(ip_address);

-- Email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  ip_address INET
);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can verify email tokens" ON email_verifications FOR SELECT USING (true);
CREATE POLICY "System can insert email verifications" ON email_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update email verifications" ON email_verifications FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_booking ON email_verifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- Booking attempts table
CREATE TABLE IF NOT EXISTS booking_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  email TEXT,
  phone TEXT,
  fingerprint TEXT,
  success BOOLEAN DEFAULT FALSE,
  blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE booking_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can insert booking attempts" ON booking_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view booking attempts" ON booking_attempts FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_attempts_ip_time ON booking_attempts(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_email_time ON booking_attempts(email, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_phone_time ON booking_attempts(phone, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_fingerprint_time ON booking_attempts(fingerprint, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_blocked ON booking_attempts(blocked) WHERE blocked = true;

-- Fraud blacklist table
CREATE TABLE IF NOT EXISTS fraud_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  ip_address INET,
  fingerprint TEXT,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'block', 'permanent')),
  no_show_count INT DEFAULT 0,
  fraud_attempts INT DEFAULT 0,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT at_least_one_identifier CHECK (
    email IS NOT NULL OR phone IS NOT NULL OR ip_address IS NOT NULL OR fingerprint IS NOT NULL
  )
);

ALTER TABLE fraud_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can check if blocked" ON fraud_blacklist FOR SELECT USING (true);
CREATE POLICY "Admins can manage blacklist" ON fraud_blacklist FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_blacklist_email ON fraud_blacklist(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON fraud_blacklist(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blacklist_ip ON fraud_blacklist(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blacklist_fingerprint ON fraud_blacklist(fingerprint) WHERE fingerprint IS NOT NULL;

-- Disposable email domains table
CREATE TABLE IF NOT EXISTS disposable_email_domains (
  domain TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by TEXT DEFAULT 'system'
);

ALTER TABLE disposable_email_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can check disposable domains" ON disposable_email_domains FOR SELECT USING (true);
CREATE POLICY "Admins can manage disposable domains" ON disposable_email_domains FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO disposable_email_domains (domain) VALUES
  ('tempmail.com'), ('10minutemail.com'), ('guerrillamail.com'), ('mailinator.com'),
  ('throwaway.email'), ('temp-mail.org'), ('fakeinbox.com'), ('trashmail.com'),
  ('maildrop.cc'), ('getnada.com'), ('temp-mail.io'), ('mohmal.com'),
  ('sharklasers.com'), ('guerrillamail.info'), ('grr.la'), ('yopmail.com')
ON CONFLICT (domain) DO NOTHING;

-- Helper functions
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address INET,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_fingerprint TEXT DEFAULT NULL
)
RETURNS TABLE (allowed BOOLEAN, reason TEXT, wait_seconds INT) AS $$
DECLARE
  v_ip_count INT;
  v_email_count INT;
BEGIN
  SELECT COUNT(*) INTO v_ip_count FROM booking_attempts
  WHERE ip_address = p_ip_address AND created_at > NOW() - INTERVAL '1 hour';
  
  IF v_ip_count >= 3 THEN
    RETURN QUERY SELECT FALSE, 'Too many attempts from this IP', 3600;
    RETURN;
  END IF;

  IF p_email IS NOT NULL THEN
    SELECT COUNT(*) INTO v_email_count FROM bookings
    WHERE customer_email = p_email
      AND booking_status IN ('PendingVerification', 'PendingPayment')
      AND created_at > NOW() - INTERVAL '24 hours';
    
    IF v_email_count >= 2 THEN
      RETURN QUERY SELECT FALSE, 'Too many pending bookings', 86400;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT TRUE, 'Allowed', 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_fraud_score(
  p_email TEXT,
  p_phone TEXT,
  p_ip_address INET,
  p_fingerprint TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_score INT := 0;
  v_domain TEXT;
BEGIN
  v_domain := SPLIT_PART(p_email, '@', 2);
  IF EXISTS (SELECT 1 FROM disposable_email_domains WHERE domain = v_domain) THEN
    v_score := v_score + 50;
  END IF;

  IF EXISTS (
    SELECT 1 FROM fraud_blacklist
    WHERE (email = p_email OR phone = p_phone OR ip_address = p_ip_address)
      AND (blocked_until IS NULL OR blocked_until > NOW())
  ) THEN
    v_score := v_score + 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE customer_email = p_email AND booking_status IN ('Completed', 'Active')
  ) THEN
    v_score := v_score + 20;
  END IF;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION expire_old_bookings()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  WITH expired AS (
    UPDATE bookings SET booking_status = 'Expired', expired_at = NOW()
    WHERE booking_status IN ('PendingVerification', 'PendingPayment')
      AND created_at < NOW() - INTERVAL '20 minutes'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM expired;

  DELETE FROM email_verifications WHERE created_at < NOW() - INTERVAL '24 hours';
  DELETE FROM booking_attempts WHERE created_at < NOW() - INTERVAL '7 days';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
