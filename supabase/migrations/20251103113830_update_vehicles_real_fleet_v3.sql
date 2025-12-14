/*
  # Update Vehicles Table with Real Fleet Data
  
  1. Changes
    - Add missing columns (luggage, deposit, minimum_age, air_conditioning)
    - Update category constraint to include real categories
    - Clear existing demo vehicles
    - Add real fleet from easyrentgraz.at
  
  2. Real Fleet
    - Peugeot 208 - EUR49/day - Compact
    - KIA Ceed - EUR57/day - Standard
    - Hyundai i30 Automatic - EUR59/day - Standard
    - Fiat 500X 4x4 Automatic - EUR74/day - Standard (SUV)
    - Hyundai i30 Kombi - EUR69/day - Standard
    - Audi Q3 - EUR98/day - Premium
  
  3. Security
    - Maintains existing RLS policies
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'luggage'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN luggage integer DEFAULT 2;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'deposit'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN deposit numeric(10,2) DEFAULT 500;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'minimum_age'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN minimum_age integer DEFAULT 25;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'air_conditioning'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN air_conditioning text;
  END IF;
END $$;

-- Update category constraint to include more categories
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_category_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_category_check 
  CHECK (category IN ('Economy', 'Standard', 'Premium', 'Luxury', 'Compact', 'Sedan', 'SUV', 'Wagon'));

-- Clear existing demo data
DELETE FROM vehicles;

-- Insert real fleet data
INSERT INTO vehicles (brand, model, year, transmission, fuel_type, seats, doors, luggage, price_per_day, deposit, minimum_age, air_conditioning, category, images, is_featured, status) VALUES
('Peugeot', '208', 2023, 'Manual', 'Petrol', 5, 4, 2, 49.00, 500, 25, 'Dual Zone', 'Economy', '["https://easyrentgraz.at/wp-content/uploads/2016/08/WhatsApp-Image-2023-11-09-at-10.30.181.jpeg"]'::jsonb, true, 'available'),
('KIA', 'Ceed', 2022, 'Manual', 'Diesel', 5, 5, 3, 57.00, 600, 25, 'Standard', 'Standard', '["https://easyrentgraz.at/wp-content/uploads/2016/08/IMG_0105.jpeg"]'::jsonb, true, 'available'),
('Hyundai', 'i30 Automatic', 2023, 'Automatic', 'Diesel', 5, 5, 3, 59.00, 600, 25, 'Dual Zone', 'Standard', '["https://easyrentgraz.at/wp-content/uploads/2025/02/IMG_0431-scaled.jpeg"]'::jsonb, true, 'available'),
('Fiat', '500X 4x4 Automatic', 2022, 'Automatic', 'Diesel', 5, 5, 3, 74.00, 700, 25, 'Dual Zone', 'Premium', '["https://easyrentgraz.at/wp-content/uploads/2016/08/IMG_0106.jpeg"]'::jsonb, true, 'available'),
('Hyundai', 'i30 Kombi', 2023, 'Manual', 'Diesel', 5, 5, 4, 69.00, 650, 25, 'Standard', 'Standard', '["https://easyrentgraz.at/wp-content/uploads/2024/12/IMG_0332-scaled.jpeg"]'::jsonb, false, 'available'),
('Audi', 'Q3', 2021, 'Manual', 'Diesel', 5, 5, 3, 98.00, 1000, 25, 'Dual Zone', 'Premium', '["https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg"]'::jsonb, false, 'available');
