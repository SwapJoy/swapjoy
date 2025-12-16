-- Migrate images from item_images table to items.images column
-- This script copies image URLs from item_images to the denormalized images column

BEGIN;

-- Update items.images with data from item_images table
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

-- Set empty array for items with no images
UPDATE public.items
SET images = '[]'::jsonb
WHERE images IS NULL;

COMMIT;

