/*
  # Add Romanian Language Support to FAQs

  1. Changes
    - Add question_ro column to faqs table
    - Add answer_ro column to faqs table
    - Update existing FAQs with Romanian translations
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add Romanian language columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'question_ro'
  ) THEN
    ALTER TABLE faqs ADD COLUMN question_ro text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'answer_ro'
  ) THEN
    ALTER TABLE faqs ADD COLUMN answer_ro text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Update existing FAQs with Romanian translations (if any exist)
-- This is just a placeholder - actual translations would be added by the admin
UPDATE faqs 
SET question_ro = question_en, 
    answer_ro = answer_en 
WHERE question_ro = '' OR question_ro IS NULL;
