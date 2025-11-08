-- Migration: Introduce language-specific titles for categories
-- Adds `title_en` and `title_ka` columns and removes legacy `name`

BEGIN;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS title_en text;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS title_ka text;

UPDATE public.categories
SET
  title_en = COALESCE(title_en, name),
  title_ka = COALESCE(title_ka, name)
WHERE name IS NOT NULL;

ALTER TABLE public.categories
  ALTER COLUMN title_en SET DEFAULT '';

ALTER TABLE public.categories
  ALTER COLUMN title_ka SET DEFAULT '';

UPDATE public.categories
SET
  title_en = COALESCE(title_en, ''),
  title_ka = COALESCE(title_ka, '')
WHERE title_en IS NULL OR title_ka IS NULL;

ALTER TABLE public.categories
  ALTER COLUMN title_en SET NOT NULL;

ALTER TABLE public.categories
  ALTER COLUMN title_ka SET NOT NULL;

ALTER TABLE public.categories
  DROP COLUMN IF EXISTS name;

COMMIT;

