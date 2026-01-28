/*
  # Revert Vehicle Blocks to 2026 - Correct Server Year

  ## Issue Identified
     - Server time is 2026-01-28, not 2025-01-28
     - Previous migration incorrectly changed dates from 2026 to 2025
     - This caused all blocks to appear expired when they should be active
     - Vehicle blocks were CORRECTLY set to 2026 initially

  ## Changes Made
     - Update all vehicle_blocks records from year 2025 back to 2026
     - Fix blocked_from dates: 2025-01-13 → 2026-01-13
     - Fix blocked_until dates: 2025-03-31 → 2026-03-31 and 2025-08-31 → 2026-08-31
     - Align with actual server timestamp (2026)

  ## Verification
     - After this migration, blocks will be active for current server time
     - Vehicles (Audi Q3, Fiat 500X, Peugeot 208) will correctly appear as blocked
*/

-- Revert incorrect date changes: 2025 → 2026
UPDATE vehicle_blocks
SET 
  blocked_from = blocked_from + INTERVAL '1 year',
  blocked_until = blocked_until + INTERVAL '1 year'
WHERE EXTRACT(YEAR FROM blocked_from) = 2025 
   OR EXTRACT(YEAR FROM blocked_until) = 2025;