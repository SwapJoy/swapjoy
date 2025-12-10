-- Migration: Add parent_id column to categories table for hierarchical category structure
-- Adds nullable parent_id column to support category hierarchies

BEGIN;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add index for parent_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

COMMIT;



