-- Drop section functions for removed home screen sections
-- This migration removes database functions that are no longer used by the app.

SET search_path = public;

DO $$
BEGIN
  -- Drop fn_favourite_categories if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'fn_favourite_categories'
  ) THEN
    DROP FUNCTION IF EXISTS public.fn_favourite_categories(
      uuid,
      numeric,
      numeric,
      numeric,
      int
    );
  END IF;

  -- Drop fn_top_picks_for_you if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'fn_top_picks_for_you'
  ) THEN
    DROP FUNCTION IF EXISTS public.fn_top_picks_for_you(
      uuid,
      numeric,
      numeric,
      numeric,
      int,
      float
    );
  END IF;

  -- Drop legacy get_top_picks_for_user if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_top_picks_for_user'
  ) THEN
    DROP FUNCTION IF EXISTS public.get_top_picks_for_user(
      uuid,
      numeric,
      numeric,
      numeric,
      integer
    );
  END IF;
END;
$$;


