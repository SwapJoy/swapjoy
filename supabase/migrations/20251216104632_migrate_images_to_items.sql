-- Migrate images from item_images table to items.images column
-- This script copies image URLs from item_images to the denormalized images column,
-- but safely no-ops if the legacy item_images table no longer exists.

DO $$
BEGIN
  -- If legacy item_images table still exists, migrate data into items.images.
  IF to_regclass('public.item_images') IS NOT NULL THEN
    UPDATE public.items i
    SET images = COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'url', ii.image_url,
            'order', ii.sort_order
          ) ORDER BY ii.sort_order ASC, ii.created_at ASC
        )
        FROM item_images ii
        WHERE ii.item_id = i.id
      ),
      '[]'::jsonb
    )
    WHERE EXISTS (
      SELECT 1 FROM item_images ii WHERE ii.item_id = i.id
    ) OR i.images = '[]'::jsonb;
  END IF;

  -- Ensure images is never NULL.
  UPDATE public.items
  SET images = '[]'::jsonb
  WHERE images IS NULL;
END;
$$;
