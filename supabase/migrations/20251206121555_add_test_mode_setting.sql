/*
  # Add Test Mode Setting for Super Admin

  1. Changes
    - Adds test_mode setting to site_settings table
    - Only accessible by super admin users
    - Allows skipping payment processing for testing purposes

  2. Setting Details
    - Key: test_mode
    - Value: {"enabled": false, "skip_payment": true}
    - Category: system
    - is_public: false (admin only)
    - Description: Test mode for debugging booking flow without payment (Super Admin only)

  3. Security
    - Only users with role='super_admin' in admin_users table can modify
    - Not visible to public users
    - For temporary testing purposes only
*/

-- Add test_mode setting to site_settings
INSERT INTO site_settings (key, value, category, description, is_public)
VALUES (
  'test_mode',
  '{"enabled": false, "skip_payment": true}'::jsonb,
  'system',
  'Test mode for debugging booking flow without payment processing (Super Admin only)',
  false
)
ON CONFLICT (key) DO NOTHING;