/*
  # Add Data Integrity CHECK Constraints
  
  This migration adds CHECK constraints to enforce data integrity at the database level.
  
  ## Issues Addressed
  
  Without CHECK constraints, the application could insert:
  - Bookings with return_date before pickup_date
  - Negative prices or rental days
  - Invalid ages below minimum requirements
  - Invalid geographic coordinates
  
  ## Constraints Added
  
  ### 1. Bookings Table
  - **Date validation**: return_date must be >= pickup_date
  - **Price validation**: total_price, rental_cost, fees must be >= 0
  - **Rental days validation**: Must be >= 1
  - **Age validation**: Customer age must be reasonable (18-120)
  - **Fraud score validation**: Must be between 0-100
  
  ### 2. Vehicle_blocks Table
  - **Date validation**: blocked_until must be >= blocked_from
  
  ### 3. Checkout_holds Table
  - **Date validation**: return_date must be >= pickup_date
  
  ### 4. Locations Table
  - **Coordinate validation**: Valid latitude (-90 to 90) and longitude (-180 to 180)
  
  ### 5. Vehicles Table
  - **Price validation**: price_per_day must be > 0
  - **Capacity validation**: seats must be > 0
  - **Age validation**: minimum_age must be reasonable (18-99)
  
  ## Impact
  
  These constraints prevent data corruption and ensure logical consistency.
  Invalid data will be rejected at INSERT/UPDATE time with clear error messages.
*/

-- =====================================================
-- BOOKINGS TABLE CONSTRAINTS
-- =====================================================

-- Ensure return date is not before pickup date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_dates_valid'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_dates_valid 
      CHECK (return_date >= pickup_date);
  END IF;
END $$;

-- Ensure total_price is non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_total_price_positive'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_total_price_positive 
      CHECK (total_price >= 0);
  END IF;
END $$;

-- Ensure rental_days is at least 1
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_rental_days_positive'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_rental_days_positive 
      CHECK (rental_days >= 1);
  END IF;
END $$;

-- Ensure customer_age is reasonable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_customer_age_valid'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_customer_age_valid 
      CHECK (customer_age >= 18 AND customer_age <= 120);
  END IF;
END $$;

-- Ensure rental_cost is non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_rental_cost_positive'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_rental_cost_positive 
      CHECK (rental_cost >= 0);
  END IF;
END $$;

-- Ensure cleaning_fee is non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_cleaning_fee_positive'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_cleaning_fee_positive 
      CHECK (cleaning_fee >= 0);
  END IF;
END $$;

-- Ensure fraud_score is between 0 and 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_fraud_score_range'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_fraud_score_range 
      CHECK (fraud_score IS NULL OR (fraud_score >= 0 AND fraud_score <= 100));
  END IF;
END $$;

-- Ensure fees are non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bookings_fees_positive'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_fees_positive 
      CHECK (
        (after_hours_fee IS NULL OR after_hours_fee >= 0) AND
        (custom_location_fee IS NULL OR custom_location_fee >= 0) AND
        (pickup_fee IS NULL OR pickup_fee >= 0) AND
        (return_fee IS NULL OR return_fee >= 0) AND
        (unlimited_km_fee IS NULL OR unlimited_km_fee >= 0) AND
        (fuel_charge_amount IS NULL OR fuel_charge_amount >= 0)
      );
  END IF;
END $$;

-- =====================================================
-- VEHICLE_BLOCKS TABLE CONSTRAINTS
-- =====================================================

-- Ensure blocked_until is not before blocked_from
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_vehicle_blocks_dates_valid'
  ) THEN
    ALTER TABLE vehicle_blocks 
      ADD CONSTRAINT chk_vehicle_blocks_dates_valid 
      CHECK (blocked_until >= blocked_from);
  END IF;
END $$;

-- =====================================================
-- CHECKOUT_HOLDS TABLE CONSTRAINTS
-- =====================================================

-- Ensure return_date is not before pickup_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_checkout_holds_dates_valid'
  ) THEN
    ALTER TABLE checkout_holds 
      ADD CONSTRAINT chk_checkout_holds_dates_valid 
      CHECK (return_date >= pickup_date);
  END IF;
END $$;

-- =====================================================
-- LOCATIONS TABLE CONSTRAINTS
-- =====================================================

-- Ensure latitude is valid (-90 to 90)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_locations_latitude_valid'
  ) THEN
    ALTER TABLE locations 
      ADD CONSTRAINT chk_locations_latitude_valid 
      CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;
END $$;

-- Ensure longitude is valid (-180 to 180)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_locations_longitude_valid'
  ) THEN
    ALTER TABLE locations 
      ADD CONSTRAINT chk_locations_longitude_valid 
      CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$;

-- Ensure fee_amount is non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_locations_fee_positive'
  ) THEN
    ALTER TABLE locations 
      ADD CONSTRAINT chk_locations_fee_positive 
      CHECK (fee_amount IS NULL OR fee_amount >= 0);
  END IF;
END $$;

-- =====================================================
-- VEHICLES TABLE CONSTRAINTS
-- =====================================================

-- Ensure price_per_day is positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_vehicles_price_positive'
  ) THEN
    ALTER TABLE vehicles 
      ADD CONSTRAINT chk_vehicles_price_positive 
      CHECK (price_per_day > 0);
  END IF;
END $$;

-- Ensure seats is positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_vehicles_seats_positive'
  ) THEN
    ALTER TABLE vehicles 
      ADD CONSTRAINT chk_vehicles_seats_positive 
      CHECK (seats > 0);
  END IF;
END $$;

-- Ensure minimum_age is reasonable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_vehicles_minimum_age_valid'
  ) THEN
    ALTER TABLE vehicles 
      ADD CONSTRAINT chk_vehicles_minimum_age_valid 
      CHECK (minimum_age >= 18 AND minimum_age <= 99);
  END IF;
END $$;

-- Ensure year is reasonable (1900 to current year + 2)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_vehicles_year_valid'
  ) THEN
    ALTER TABLE vehicles 
      ADD CONSTRAINT chk_vehicles_year_valid 
      CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2);
  END IF;
END $$;
