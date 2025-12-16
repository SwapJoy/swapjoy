-- Migrate category data from categories table to items.category column
-- This script copies category properties to the denormalized category column

BEGIN;

-- Update items.category with data from categories table
UPDATE public.items i
SET category = jsonb_build_object(
  'title_en', c.title_en,
  'title_ka', c.title_ka,
  'icon', c.icon,
  'color', c.color,
  'slug', c.slug
)
FROM categories c
WHERE i.category_id = c.id
  AND i.category_id IS NOT NULL;

-- Set category to NULL for items with no category_id
UPDATE public.items
SET category = NULL
WHERE category_id IS NULL;

COMMIT;

