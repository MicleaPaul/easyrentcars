/*
  # Update Contact Address to Correct Location

  1. Changes
    - Updates `contact_info` in `site_settings` table
    - Sets correct street address: "Alte Poststraße 286"
    - Updates postal code from "8010" to "8053"
    - Maintains existing phone, email, city, and country

  2. Address Details
    - Street: Alte Poststraße 286
    - City: Graz
    - Postal Code: 8053
    - Country: Austria

  3. Impact
    - Contact Section will display correct address
    - Structured Data (SEO) will reflect correct location
    - Site Settings dashboard will show updated postal code
*/

-- Update contact_info address fields to correct location
UPDATE site_settings
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      value,
      '{address,street}',
      '"Alte Poststraße 286"'
    ),
    '{address,postalCode}',
    '"8053"'
  ),
  '{address,city}',
  '"Graz"'
)
WHERE key = 'contact_info';
