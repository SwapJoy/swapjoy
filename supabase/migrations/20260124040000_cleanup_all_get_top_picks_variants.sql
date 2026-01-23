-- Cleanup: Drop ALL variants of get_top_picks_for_user and keep only the correct one
-- This handles different parameter type variations (integer vs int4, double precision vs float8, etc.)

-- Drop all possible variations using CASCADE to handle dependencies
DO $$
DECLARE
  func_record record;
BEGIN
  -- Find all functions with this name and drop them
  FOR func_record IN 
    SELECT 
      p.proname as func_name,
      pg_get_function_identity_arguments(p.oid) as func_args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'get_top_picks_for_user'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
      func_record.func_name, 
      func_record.func_args
    );
    RAISE NOTICE 'Dropped function: %(%)', func_record.func_name, func_record.func_args;
  END LOOP;
END;
$$;

-- Now create the single correct version with pagination support
CREATE OR REPLACE FUNCTION public.get_top_picks_for_user(
  p_user_id    uuid,
  p_limit      integer,
  p_user_lat   double precision,
  p_user_lng   double precision,
  p_radius_km  double precision,
  p_offset     integer DEFAULT 0
)
RETURNS TABLE (
  id              uuid,
  user_id         uuid,
  title           varchar(255),
  description     text,
  price           numeric(10,2),
  currency        varchar(3),
  category_id     uuid,
  condition       varchar(50),
  status          varchar(50),
  location_lat    numeric(10,8),
  location_lng    numeric(11,8),
  created_at      timestamptz,
  updated_at      timestamptz,
  images          jsonb,
  category        jsonb,
  "user"          jsonb,
  distance_km     double precision,
  score           double precision
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
WITH base AS (
  SELECT
    i.id,
    i.user_id,
    i.title,
    i.description,
    i.price,
    i.currency,
    i.category_id,
    i.condition,
    i.status,
    i.location_lat,
    i.location_lng,
    i.created_at,
    i.updated_at,
    COALESCE(i.images, '[]'::jsonb) AS images,
    i.category,
    i."user",
    CASE
      WHEN i.geo IS NOT NULL AND p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
      THEN ST_Distance(
        i.geo,
        ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography
      ) / 1000.0
      ELSE NULL
    END AS distance_km
  FROM public.items i
  WHERE i.status = 'available'
    AND i.user_id != p_user_id
    AND (
      i.geo IS NULL
      OR p_radius_km IS NULL
      OR p_user_lat IS NULL
      OR p_user_lng IS NULL
      OR ST_DWithin(
        i.geo,
        ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography,
        p_radius_km * 1000.0
      )
    )
),
filtered AS (
  SELECT *
  FROM base
  WHERE distance_km IS NULL OR distance_km <= p_radius_km
),
scored AS (
  SELECT
    *,
    CASE
      WHEN distance_km IS NOT NULL AND p_radius_km > 0
      THEN GREATEST(0.0, 1.0 - (distance_km / NULLIF(p_radius_km, 0)))
      ELSE 0.5
    END AS distance_score,
    CASE
      WHEN created_at >= now() - interval '7 days'
      THEN 1.0
      WHEN created_at >= now() - interval '30 days'
      THEN 0.7
      WHEN created_at >= now() - interval '90 days'
      THEN 0.4
      ELSE 0.2
    END AS recency_score
  FROM filtered
),
blended AS (
  SELECT
    *,
    (0.6 * distance_score + 0.4 * recency_score) AS score
  FROM scored
)
SELECT
  b.id,
  b.user_id,
  b.title,
  b.description,
  b.price,
  b.currency,
  b.category_id,
  b.condition,
  b.status,
  b.location_lat,
  b.location_lng,
  b.created_at,
  b.updated_at,
  b.images,
  b.category,
  b."user",
  b.distance_km,
  b.score
FROM blended b
ORDER BY
  b.score DESC,
  b.created_at DESC
LIMIT COALESCE(p_limit, 20)
OFFSET COALESCE(p_offset, 0);
$$;

GRANT EXECUTE ON FUNCTION public.get_top_picks_for_user(
  uuid, integer, double precision, double precision, double precision, integer
) TO authenticated;
