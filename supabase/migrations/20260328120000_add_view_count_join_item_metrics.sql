-- Expose view_count from item_metrics on listing RPCs (LEFT JOIN, no extra client round-trip)
-- Must DROP first: Postgres does not allow CREATE OR REPLACE to change RETURNS TABLE shape.

DROP FUNCTION IF EXISTS public.get_top_picks_for_user(
  uuid,
  integer,
  double precision,
  double precision,
  double precision,
  integer
);

-- =============================================================================
-- 1. get_top_picks_for_user
-- =============================================================================
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
  view_count      integer,
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
    COALESCE(im.view_count, 0)::integer AS view_count,
    CASE
      WHEN i.geo IS NOT NULL AND p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
      THEN ST_Distance(
        i.geo,
        ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography
      ) / 1000.0
      ELSE NULL
    END AS distance_km
  FROM public.items i
  LEFT JOIN public.item_metrics im ON im.item_id = i.id
  WHERE i.status = 'available'
    AND i.user_id != p_user_id
    AND (
      (p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL)
      OR
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
  WHERE (
    (p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL)
    OR
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
    CASE
      WHEN (SELECT preference_embedding FROM user_pref) IS NOT NULL
        AND f.embedding IS NOT NULL
      THEN GREATEST(0.0, 1.0 - (f.embedding <=> (SELECT preference_embedding FROM user_pref)))
      ELSE 0.5
    END AS similarity_score,
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
    CASE
      WHEN (SELECT preference_embedding FROM user_pref) IS NOT NULL
      THEN (0.7 * similarity_score + 0.3 * recency_score)
      ELSE recency_score
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
  b.view_count,
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

-- =============================================================================
-- 2. search_items
-- =============================================================================
DROP FUNCTION IF EXISTS public.search_items(
  text,
  uuid[],
  text[],
  numeric,
  numeric,
  double precision,
  double precision,
  double precision,
  integer,
  integer
);

CREATE OR REPLACE FUNCTION public.search_items(
  query_text text DEFAULT NULL,
  category_ids uuid[] DEFAULT ARRAY[]::uuid[],
  conditions text[] DEFAULT ARRAY[]::text[],
  min_price numeric DEFAULT 0,
  max_price numeric DEFAULT NULL,
  user_lat double precision DEFAULT NULL,
  user_lng double precision DEFAULT NULL,
  distance_km double precision DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title varchar(255),
  description text,
  price decimal(10,2),
  currency varchar(3),
  condition varchar(50),
  category_id uuid,
  user_id uuid,
  similarity float,
  images jsonb,
  category jsonb,
  "user" jsonb,
  location_lat numeric(10,8),
  location_lng numeric(11,8),
  status varchar(50),
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  calculated_distance_km numeric(10,2),
  view_count integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_query text := NULLIF(trim(query_text), '');
BEGIN
  RETURN QUERY
  WITH ranked_items AS (
    SELECT
      i.*,
      COALESCE(im.view_count, 0)::integer AS view_count,
      CASE
        WHEN normalized_query IS NOT NULL THEN (
          ts_rank(
            to_tsvector('simple', COALESCE(i.title, '') || ' ' || COALESCE(i.description, '')),
            plainto_tsquery('simple', normalized_query)
          )
        )::double precision
        ELSE NULL::double precision
      END AS text_rank
    FROM public.items i
    LEFT JOIN public.item_metrics im ON im.item_id = i.id
    WHERE
      i.status = 'available'
      AND i.price >= COALESCE(min_price, 0)
      AND (max_price IS NULL OR i.price <= max_price)
      AND (
        array_length(category_ids, 1) IS NULL
        OR i.category_id = ANY(category_ids)
      )
      AND (
        array_length(conditions, 1) IS NULL
        OR lower(i.condition) = ANY(
          ARRAY(
            SELECT lower(cond)
            FROM unnest(conditions) AS cond
          )
        )
      )
      AND (
        normalized_query IS NULL
        OR to_tsvector('simple', COALESCE(i.title, '') || ' ' || COALESCE(i.description, ''))
            @@ plainto_tsquery('simple', normalized_query)
        OR i.title ILIKE '%' || normalized_query || '%'
        OR i.description ILIKE '%' || normalized_query || '%'
      )
      AND (
        distance_km IS NULL
        OR user_lat IS NULL
        OR user_lng IS NULL
        OR i.geo IS NULL
        OR ST_DWithin(
          i.geo,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
          distance_km * 1000
        )
      )
  )
  SELECT
    r.id,
    r.title,
    r.description,
    r.price,
    r.currency,
    r.condition,
    r.category_id,
    r.user_id,
    r.text_rank::float AS similarity,
    COALESCE(r.images, '[]'::jsonb) AS images,
    r.category,
    r."user",
    r.location_lat,
    r.location_lng,
    r.status,
    r.created_at,
    r.updated_at,
    CASE
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND r.geo IS NOT NULL THEN
        ROUND((ST_Distance(
          r.geo,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000)::numeric, 2)
      ELSE NULL
    END AS calculated_distance_km,
    r.view_count
  FROM ranked_items r
  ORDER BY
    CASE WHEN normalized_query IS NOT NULL THEN r.text_rank ELSE NULL END DESC NULLS LAST,
    r.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 20), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_items(text, uuid[], text[], numeric, numeric, double precision, double precision, double precision, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_items(text, uuid[], text[], numeric, numeric, double precision, double precision, double precision, integer, integer) TO anon;

COMMENT ON FUNCTION public.search_items IS 'Searches available items with full-text + ilike query matching and filters for categories, conditions, price, and distance. Returns denormalized listing payload with pagination and view_count.';

DROP FUNCTION IF EXISTS public.fn_near_you(uuid, numeric, numeric, numeric, integer);

-- =============================================================================
-- 3. fn_near_you (explore / sections)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_near_you(
  p_user_id    uuid,
  p_user_lat   numeric,
  p_user_lng   numeric,
  p_radius_km  numeric DEFAULT 50,
  p_limit      int     DEFAULT 10
)
RETURNS TABLE (
  id                uuid,
  title             varchar(200),
  description       text,
  price             numeric(10,2),
  currency          varchar(3),
  condition         varchar(50),
  status            varchar(50),
  location_lat      numeric(10,8),
  location_lng      numeric(11,8),
  created_at        timestamp without time zone,
  updated_at        timestamp without time zone,
  category_id       uuid,
  user_id           uuid,
  images            jsonb,
  category          jsonb,
  "user"            jsonb,
  view_count        integer,
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH items_with_distance AS (
    SELECT
      i.*,
      COALESCE(im.view_count, 0)::integer AS view_count,
      CAST(
        CASE
          WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
           AND i.location_lat IS NOT NULL AND i.location_lng IS NOT NULL
          THEN (
            6371 * 2 * ASIN(
              SQRT(
                POWER(SIN(RADIANS(i.location_lat - p_user_lat) / 2), 2) +
                COS(RADIANS(p_user_lat)) *
                COS(RADIANS(i.location_lat)) *
                POWER(SIN(RADIANS(i.location_lng - p_user_lng) / 2), 2)
              )
            )
          )
          ELSE NULL
        END AS numeric(10,2)
      ) AS distance_km
    FROM items i
    LEFT JOIN public.item_metrics im ON im.item_id = i.id
    WHERE i.status = 'available'
      AND i.user_id <> p_user_id
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
  )
  SELECT
    iwd.id,
    iwd.title,
    iwd.description,
    iwd.price,
    iwd.currency,
    iwd.condition,
    iwd.status,
    iwd.location_lat,
    iwd.location_lng,
    iwd.created_at,
    iwd.updated_at,
    iwd.category_id,
    iwd.user_id,
    COALESCE(iwd.images, '[]'::jsonb) AS images,
    iwd.category,
    iwd."user",
    iwd.view_count,
    iwd.distance_km
  FROM items_with_distance iwd
  WHERE
    (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
  ORDER BY
    iwd.distance_km ASC NULLS LAST,
    iwd.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_near_you IS 'Returns items near the user based on location proximity, using denormalized data and item_metrics.view_count';
