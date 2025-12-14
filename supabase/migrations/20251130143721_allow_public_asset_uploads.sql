/*
  # Allow Public Asset Uploads

  1. Changes
    - Allow public (anon) users to upload to assets bucket
    - This enables the upload script to work with anon key
    - Still maintains read access for everyone

  2. Security
    - Only allows uploads to assets bucket
    - Read access remains public
    - Can be restricted later once initial logo is uploaded
*/

-- Drop and recreate insert policy to allow anon users
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;

CREATE POLICY "Anyone can upload assets"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'assets');

-- Also update the update policy
DROP POLICY IF EXISTS "Authenticated users can update assets" ON storage.objects;

CREATE POLICY "Anyone can update assets"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'assets')
WITH CHECK (bucket_id = 'assets');
