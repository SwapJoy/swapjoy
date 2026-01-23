-- Force fix location filtering - drop all versions and recreate with strict filtering
-- This ensures only items within radius are returned when user location is provided

-- Drop all existing versions of the function
DROP FUNCTION IF EXISTS public.get_top_picks_for_user(
  uuid, integer, double precision, double precision, double precision
);
DROP FUNCTION IF EXISTS public.get_top_picks_for_user(
  uuid, integer, double precision, double precision, double precision, integer
);

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
WITH user_pref AS (
  SELECT preference_embedding
  FROM public.users
  WHERE id = p_user_id
),
base AS (
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
    i.embedding,
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
    -- STRICT FILTERING: When user has location and radius, ONLY include items within radius
    AND (
      -- Case 1: User has no location/radius -> show all items
      (p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL)
      OR
      -- Case 2: User has location and radius -> ONLY items with geo within radius
      (p_user_lat IS NOT NULL 
       AND p_user_lng IS NOT NULL 
       AND p_radius_km IS NOT NULL
       AND i.geo IS NOT NULL
       AND ST_DWithin(
         i.geo,
         ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography,
         p_radius_km * 1000.0
       ))
    )
),
filtered AS (
  SELECT *
  FROM base
  -- Double-check: exclude items without distance when location filtering is active
  WHERE (
    -- If user has no location/radius, show all (including items without geo)
    (p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL)
    OR
    -- If user has location/radius, ONLY items with valid distance within radius
    (p_user_lat IS NOT NULL 
     AND p_user_lng IS NOT NULL 
     AND p_radius_km IS NOT NULL
     AND distance_km IS NOT NULL
     AND distance_km <= p_radius_km)
  )
),
scored AS (
  SELECT
    f.*,
    -- Semantic similarity score (using preference_embedding if available)
    CASE
      WHEN (SELECT preference_embedding FROM user_pref) IS NOT NULL 
        AND f.embedding IS NOT NULL
      THEN GREATEST(0.0, 1.0 - (f.embedding <=> (SELECT preference_embedding FROM user_pref)))
      ELSE 0.5
    END AS similarity_score,
    -- Distance score
    CASE
      WHEN f.distance_km IS NOT NULL AND p_radius_km > 0
      THEN GREATEST(0.0, 1.0 - (f.distance_km / NULLIF(p_radius_km, 0)))
      ELSE 0.5
    END AS distance_score,
    -- Recency score
    CASE
      WHEN f.created_at >= now() - interval '7 days'
      THEN 1.0
      WHEN f.created_at >= now() - interval '30 days'
      THEN 0.7
      WHEN f.created_at >= now() - interval '90 days'
      THEN 0.4
      ELSE 0.2
    END AS recency_score
  FROM filtered f
),
blended AS (
  SELECT
    *,
    -- Weighted blend: 50% similarity, 30% distance, 20% recency
    CASE
      WHEN (SELECT preference_embedding FROM user_pref) IS NOT NULL
      THEN (0.5 * similarity_score + 0.3 * distance_score + 0.2 * recency_score)
      ELSE (0.6 * distance_score + 0.4 * recency_score)
    END AS score
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
