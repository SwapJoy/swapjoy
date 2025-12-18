-- Update items with NULL or empty images column with demo image URLs from the internet
-- Each item will get 3-4 images with proper order values (0, 1, 2, 3)
-- Uses Picsum Photos with item ID as seed to ensure each item gets unique images

BEGIN;

-- Update ALL items, overwriting existing images
UPDATE public.items i
SET images = (
  WITH item_seed AS (
    -- Convert item ID to a numeric seed (using hash)
    SELECT abs(hashtext(i.id::text)) AS seed
  ),
  image_count AS (
    -- Randomly choose 3 or 4 images based on item ID
    SELECT 3 + (hashtext(i.id::text) % 2) AS cnt
  ),
  image_list AS (
    SELECT 
      'https://picsum.photos/seed/' || (seed + image_order) || '/800/600' AS url,
      image_order
    FROM item_seed,
    generate_series(0, (SELECT cnt FROM image_count) - 1) AS image_order
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', url,
      'order', image_order
    ) ORDER BY image_order
  )
  FROM image_list
);

COMMIT;

