/*
  # Add Critical Performance Indexes
  
  This migration adds essential indexes to improve query performance across the application.
  
  ## Critical Issues Addressed
  
  The bookings table had **1,157 sequential scans with ZERO index scans**, causing severe
  performance degradation. This migration adds indexes to eliminate sequential scans.
  
  ## Indexes Added
  
  ### 1. Bookings Table (CRITICAL)
  - **Composite index on (vehicle_id, pickup_date, return_date)** - Most critical for availability queries
  - **Index on booking_status** - Used for filtering active/pending bookings
  - **Index on payment_status** - Used for payment processing queries
  - **Index on customer_email** - Used for customer booking lookups
  - **Partial indexes on stripe_payment_intent_id and stripe_session_id** - For Stripe webhook lookups
  - **Index on pickup_date** - For date range queries and sorting
  - **Index on created_at** - For sorting and filtering recent bookings
  
  ### 2. Fraud_blacklist Table (SECURITY CRITICAL)
  - **Partial indexes on email, phone, ip_address, fingerprint** - For fraud check lookups
  - Uses partial indexes (WHERE NOT NULL) to save space and improve performance
  
  ### 3. Vehicles Table
  - **Index on category** - Used for filtering by vehicle type
  - **Partial index on is_featured** - For homepage display
  - **Index on price_per_day** - For sorting and filtering
  
  ### 4. Locations Table
  - **Partial index on is_active** - For filtering active locations
  - **Index on name** - For location lookups
  
  ## Performance Impact
  
  Expected improvements:
  - Availability checks: 100x-1000x faster (eliminate full table scans)
  - Customer booking lookups: 50x-100x faster
  - Fraud checks: 100x faster
  - Admin dashboard queries: 10x-50x faster
  
  ## Index Strategy
  
  - Composite indexes for multi-column WHERE clauses
  - Partial indexes for filtered queries (WHERE column = true)
  - B-tree indexes for equality and range queries
  - Strategic index ordering for query optimizer efficiency
*/

-- =====================================================
-- BOOKINGS TABLE INDEXES (HIGHEST PRIORITY)
-- =====================================================

-- Most critical: Composite index for availability queries
-- This index supports: WHERE vehicle_id = ? AND pickup_date <= ? AND return_date >= ?
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_dates 
  ON bookings (vehicle_id, pickup_date, return_date);

-- Status filtering (extremely common in queries)
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status 
  ON bookings (booking_status);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status 
  ON bookings (payment_status);

-- Customer lookup (used in customer portal and admin dashboard)
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email 
  ON bookings (customer_email);

-- Stripe integration lookups (partial indexes to save space)
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent 
  ON bookings (stripe_payment_intent_id) 
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session 
  ON bookings (stripe_session_id) 
  WHERE stripe_session_id IS NOT NULL;

-- Date range queries and sorting
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date 
  ON bookings (pickup_date);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at 
  ON bookings (created_at DESC);

-- Composite index for active bookings (availability checks)
-- This optimizes: WHERE vehicle_id = ? AND booking_status IN (...) AND date overlap
CREATE INDEX IF NOT EXISTS idx_bookings_active_by_vehicle 
  ON bookings (vehicle_id, booking_status, pickup_date, return_date)
  WHERE booking_status IN ('Confirmed', 'Active', 'confirmed', 'active', 'PendingPayment', 'PendingVerification', 'pending_payment', 'pending_verification');

-- =====================================================
-- FRAUD_BLACKLIST TABLE INDEXES (SECURITY)
-- =====================================================

-- Email lookup for fraud checks
CREATE INDEX IF NOT EXISTS idx_fraud_blacklist_email 
  ON fraud_blacklist (email) 
  WHERE email IS NOT NULL;

-- Phone lookup for fraud checks
CREATE INDEX IF NOT EXISTS idx_fraud_blacklist_phone 
  ON fraud_blacklist (phone) 
  WHERE phone IS NOT NULL;

-- IP address lookup for fraud checks
CREATE INDEX IF NOT EXISTS idx_fraud_blacklist_ip 
  ON fraud_blacklist (ip_address) 
  WHERE ip_address IS NOT NULL;

-- Browser fingerprint lookup for fraud checks
CREATE INDEX IF NOT EXISTS idx_fraud_blacklist_fingerprint 
  ON fraud_blacklist (fingerprint) 
  WHERE fingerprint IS NOT NULL;

-- =====================================================
-- VEHICLES TABLE INDEXES
-- =====================================================

-- Category filtering (used in fleet display)
CREATE INDEX IF NOT EXISTS idx_vehicles_category 
  ON vehicles (category);

-- Featured vehicles (used on homepage)
CREATE INDEX IF NOT EXISTS idx_vehicles_is_featured 
  ON vehicles (is_featured) 
  WHERE is_featured = true;

-- Price sorting and filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_price 
  ON vehicles (price_per_day);

-- Status filtering (combined with other filters)
-- Note: This might already exist, using IF NOT EXISTS for safety
CREATE INDEX IF NOT EXISTS idx_vehicles_status 
  ON vehicles (status);

-- =====================================================
-- LOCATIONS TABLE INDEXES
-- =====================================================

-- Active locations filtering
CREATE INDEX IF NOT EXISTS idx_locations_is_active 
  ON locations (is_active) 
  WHERE is_active = true;

-- Location name lookups
CREATE INDEX IF NOT EXISTS idx_locations_name 
  ON locations (name);

-- =====================================================
-- CHECKOUT_HOLDS TABLE INDEXES
-- =====================================================

-- Vehicle and date overlap queries
CREATE INDEX IF NOT EXISTS idx_checkout_holds_vehicle_dates 
  ON checkout_holds (vehicle_id, pickup_date, return_date);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_checkout_holds_status 
  ON checkout_holds (status);

-- Expiration cleanup queries
CREATE INDEX IF NOT EXISTS idx_checkout_holds_expires_at 
  ON checkout_holds (expires_at) 
  WHERE status = 'active';

-- =====================================================
-- VEHICLE_BLOCKS TABLE INDEXES
-- =====================================================

-- Vehicle and date overlap queries
CREATE INDEX IF NOT EXISTS idx_vehicle_blocks_vehicle_dates 
  ON vehicle_blocks (vehicle_id, blocked_from, blocked_until);
