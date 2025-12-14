/*
  # Create Vehicle Images Storage Bucket

  ## Overview
  Creates a public storage bucket for vehicle images with optimized policies
  for performance and security. Only admins can upload/delete, but everyone
  can view images for public car rental browsing.

  ## New Storage Configuration

  ### 1. vehicle-images bucket
  - Public read access for all users (required for public website)
  - Admin-only write/upload access
  - Admin-only delete access
  - Organized by vehicle_id folders for easy management
  - Supports unlimited images per vehicle

  ## Security
  - Public can SELECT (read/view) all images
  - Only authenticated admins can INSERT (upload)
  - Only authenticated admins can UPDATE
  - Only authenticated admins can DELETE
  - All admin operations verified against admin_users table

  ## Performance Optimizations
  - Public bucket enables CDN caching
  - Organized folder structure for efficient retrieval
  - Supports WebP format for optimal compression
  - File size limits enforced at application level

  ## Important Notes
  1. Images stored at: vehicle-images/{vehicle_id}/{timestamp}_{filename}
  2. Supports JPG, PNG, WebP formats
  3. Application handles compression before upload
  4. Cleanup of orphaned images handled by application
*/

-- Create the storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vehicle images" ON storage.objects;

-- Policy: Anyone can view vehicle images (public read)
CREATE POLICY "Public can view vehicle images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'vehicle-images');

-- Policy: Only admins can upload vehicle images
CREATE POLICY "Admins can upload vehicle images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Only admins can update vehicle images
CREATE POLICY "Admins can update vehicle images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'vehicle-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Only admins can delete vehicle images
CREATE POLICY "Admins can delete vehicle images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Verify migration success
SELECT
  'Migration completed successfully!' as status,
  'vehicle-images bucket created with admin-only write policies' as message;