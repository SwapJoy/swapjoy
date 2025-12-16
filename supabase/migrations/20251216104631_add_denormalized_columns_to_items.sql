-- Add denormalized JSONB columns to items table
-- This eliminates the need for JOINs in database functions, improving query performance

BEGIN;

-- Add images column: JSONB array of {url: string, order: number} objects
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add category column: JSONB object with {title_en, title_ka, icon, color, slug}
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS category JSONB DEFAULT NULL;

-- Add user column: JSONB object with {username, profile_image_url, firstname, lastname}
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS "user" JSONB DEFAULT NULL;

-- Add indexes for JSONB columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_items_images ON public.items USING gin (images);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items USING gin (category);
CREATE INDEX IF NOT EXISTS idx_items_user ON public.items USING gin ("user");

COMMENT ON COLUMN public.items.images IS 'Denormalized array of item images: [{url: string, order: number}]';
COMMENT ON COLUMN public.items.category IS 'Denormalized category data: {title_en, title_ka, icon, color, slug}';
COMMENT ON COLUMN public.items."user" IS 'Denormalized user data: {username, profile_image_url, firstname, lastname}';

COMMIT;

