/*
  # Create Site Assets Storage Bucket

  ## Overview
  Creates a public storage bucket for general site assets (logos, favicons, banners)
  with optimized policies for performance and security. Only admins can upload/delete,
  but everyone can view assets for public website access.

  ## New Storage Configuration

  ### 1. site-assets bucket
  - Public read access for all users (required for public website)
  - Admin-only write/upload access
  - Admin-only delete access
  - Organized by asset type folders (logos/, favicons/, banners/)
  - Supports common image formats

  ## Security
  - RLS enabled on storage bucket
  - Public can SELECT (read/view) all assets
  - Only authenticated admins can INSERT (upload)
  - Only authenticated admins can UPDATE
  - Only authenticated admins can DELETE
  - All admin operations verified against admin_users table

  ## Important Notes
  1. Assets stored at: site-assets/{type}/{filename}
  2. Supports JPG, PNG, SVG, WebP formats
  3. 5MB file size limit per asset
  4. Used for branding, logos, and general site images
*/

-- Create the storage bucket for site assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view site assets (public read)
CREATE POLICY "Public can view site assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'site-assets');

-- Policy: Only admins can upload site assets
CREATE POLICY "Admins can upload site assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Only admins can update site assets
CREATE POLICY "Admins can update site assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'site-assets' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'site-assets' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Only admins can delete site assets
CREATE POLICY "Admins can delete site assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'site-assets' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Insert default site_logo setting (will be updated with actual URL after upload)
INSERT INTO settings (key, value)
VALUES (
  'site_logo',
  '{"url": "", "alt": "EazyRentGraz Logo", "width": 1200, "height": 400}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Verify migration success
SELECT
  'Migration completed successfully!' as status,
  'site-assets bucket created with admin-only write policies' as message;
