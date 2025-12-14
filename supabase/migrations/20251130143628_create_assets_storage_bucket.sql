/*
  # Create Assets Storage Bucket for Logo and Site Assets

  1. New Storage Bucket
    - `assets` bucket created with public access
    - Used for storing logo and other site assets
    - Files will be publicly accessible via URL

  2. Security Policies
    - Public read access for all users (SELECT)
    - Authenticated admin users can upload/update files (INSERT, UPDATE)
    - Only authenticated users can delete files (DELETE)

  3. Purpose
    - Store site logo (easyrentcars-logo.png)
    - Store other public assets (hero images, banners, etc.)
    - CDN-friendly with cache headers
*/

-- Create public assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON storage.objects;

-- Allow public read access to assets
CREATE POLICY "Public can view assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');

-- Allow authenticated users to upload assets
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Allow authenticated users to update assets
CREATE POLICY "Authenticated users can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets')
WITH CHECK (bucket_id = 'assets');

-- Allow authenticated users to delete assets
CREATE POLICY "Authenticated users can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets');
