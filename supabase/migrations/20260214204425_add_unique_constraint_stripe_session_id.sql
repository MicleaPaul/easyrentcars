/*
  # Add UNIQUE constraint on stripe_session_id

  1. Changes
    - Add a UNIQUE constraint on `bookings.stripe_session_id` to prevent duplicate
      bookings from the same Stripe checkout session
    - This guards against a race condition where both the Stripe webhook and the
      verify-stripe-payment fallback could insert a booking simultaneously

  2. Important Notes
    - NULL values are allowed (cash bookings don't have a stripe_session_id)
    - PostgreSQL UNIQUE constraints allow multiple NULLs by default, so this
      does not affect cash/non-Stripe bookings
    - The existing index `idx_bookings_stripe_session` is kept for query performance
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_bookings_stripe_session_id'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT uq_bookings_stripe_session_id UNIQUE (stripe_session_id);
  END IF;
END $$;
