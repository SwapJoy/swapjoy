-- Drop the legacy item_images table now that images are denormalized on items.images
-- This migration assumes all consumers have been updated to use items.images instead.

BEGIN;

-- Drop any RLS policies that might reference item_images (defensive; DROP TABLE will handle most dependencies)
DO $$
BEGIN
  IF to_regclass('public.item_images') IS NOT NULL THEN
    PERFORM 1;
    -- Policies will be dropped automatically with the table; this block exists for clarity.
  END IF;
END$$;

-- Drop the table and any remaining dependent objects
DROP TABLE IF EXISTS public.item_images CASCADE;

COMMIT;


