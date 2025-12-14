/*
  # Create vehicle_blocks table for temporary vehicle blocking

  1. New Tables
    - `vehicle_blocks`
      - `id` (uuid, primary key) - Unique identifier for each block
      - `vehicle_id` (uuid, foreign key) - References vehicles table
      - `blocked_from` (timestamptz) - Start date/time of block period
      - `blocked_until` (timestamptz) - End date/time of block period
      - `reason` (text) - Reason for blocking (e.g., "Phone reservation", "Maintenance")
      - `contact_info` (text, nullable) - Optional contact information for the client
      - `created_by` (uuid, nullable) - Admin user who created the block
      - `created_at` (timestamptz) - Timestamp when block was created
      - `updated_at` (timestamptz) - Timestamp when block was last updated

  2. Security
    - Enable RLS on `vehicle_blocks` table
    - Add policy for authenticated admins to manage blocks
    - Add policy for public to read active blocks (for availability checking)

  3. Indexes
    - Index on vehicle_id for fast lookups
    - Index on blocked_from and blocked_until for date range queries
    - Check constraint to ensure blocked_until is after blocked_from

  4. Notes
    - Blocks function like bookings for availability checking
    - Vehicles remain available outside blocked periods
    - Admins can quickly block vehicles for phone reservations or other reasons
*/

-- Create vehicle_blocks table
CREATE TABLE IF NOT EXISTS vehicle_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  blocked_from timestamptz NOT NULL,
  blocked_until timestamptz NOT NULL,
  reason text NOT NULL DEFAULT 'Rezervare telefonică',
  contact_info text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_block_period CHECK (blocked_until > blocked_from)
);

-- Enable RLS
ALTER TABLE vehicle_blocks ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_blocks_vehicle_id ON vehicle_blocks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_blocks_dates ON vehicle_blocks(blocked_from, blocked_until);

-- Policy: Admins can view all blocks
CREATE POLICY "Admins can view all vehicle blocks"
  ON vehicle_blocks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Admins can insert blocks
CREATE POLICY "Admins can create vehicle blocks"
  ON vehicle_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Admins can update blocks
CREATE POLICY "Admins can update vehicle blocks"
  ON vehicle_blocks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Admins can delete blocks
CREATE POLICY "Admins can delete vehicle blocks"
  ON vehicle_blocks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Public can read active blocks for availability checking
CREATE POLICY "Public can read active vehicle blocks"
  ON vehicle_blocks
  FOR SELECT
  TO anon
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
DROP TRIGGER IF EXISTS trigger_update_vehicle_blocks_updated_at ON vehicle_blocks;
CREATE TRIGGER trigger_update_vehicle_blocks_updated_at
  BEFORE UPDATE ON vehicle_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_blocks_updated_at();