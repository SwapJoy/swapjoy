-- Create function to get top picks for user using AI vector similarity
-- This function finds items similar to the user's items using vector embeddings

SET search_path = public;

CREATE OR REPLACE FUNCTION public.fn_top_picks_for_you(
  p_user_id         uuid,
  p_user_lat        numeric,
  p_user_lng        numeric,
  p_radius_km       numeric DEFAULT NULL,  -- if NULL, no radius filter
  p_limit           int     DEFAULT 50,
  p_match_threshold float   DEFAULT 0.2
)
RETURNS TABLE (
  -- item
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
  -- category (ID only)
  category_id       uuid,
  -- user
  user_id           uuid,
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  -- images (all)
  images            jsonb,
  -- distance
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_items_embedding vector(1536);
  v_user_items_count     int;
BEGIN
  -- 1) Get user's items count and a representative embedding
  WITH user_items_stats AS (
    SELECT 
      COUNT(*) AS cnt,
      (
        SELECT i2.embedding
        FROM items i2
        WHERE i2.user_id = p_user_id
          AND i2.status = 'available'
          AND i2.embedding IS NOT NULL
        LIMIT 1
      ) AS first_embedding
    FROM items i
    WHERE i.user_id = p_user_id 
      AND i.status = 'available' 
      AND i.embedding IS NOT NULL
  )
  SELECT 
    cnt,
    first_embedding
  INTO v_user_items_count, v_user_items_embedding
  FROM user_items_stats;

  -- No basis to recommend anything
  IF v_user_items_count = 0 OR v_user_items_embedding IS NULL THEN
    RETURN;
  END IF;

  -- 2) Main query
  RETURN QUERY
  WITH items_with_distance AS (
    SELECT
      i.*,
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
    WHERE i.status = 'available'
      AND i.user_id <> p_user_id
      AND i.embedding IS NOT NULL
      AND (
        p_radius_km IS NULL
        OR p_user_lat IS NULL
        OR p_user_lng IS NULL
        OR (
          i.location_lat IS NOT NULL 
          AND i.location_lng IS NOT NULL
          -- fast bounding box if radius given
          AND i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                                AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                                AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
  ),
  vector_scored AS (
    SELECT
      iwd.*,
      (1 - (iwd.embedding <=> v_user_items_embedding))::float AS similarity_score
    FROM items_with_distance iwd
    WHERE
      -- if radius is set, filter strictly by distance
      (
        p_radius_km IS NULL
        OR iwd.distance_km IS NULL
        OR iwd.distance_km <= p_radius_km
      )
      AND (1 - (iwd.embedding <=> v_user_items_embedding)) >= p_match_threshold
  ),
  images_agg AS (
    SELECT
      ii.item_id,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id',         ii.id,
            'url',        ii.image_url,
            'is_primary', ii.is_primary,
            'created_at', ii.created_at
          )
          ORDER BY ii.is_primary DESC NULLS LAST, ii.created_at ASC
        ) FILTER (WHERE ii.item_id IS NOT NULL),
        '[]'::jsonb
      ) AS images
    FROM item_images ii
    GROUP BY ii.item_id
  )
  SELECT
    vs.id,
    vs.title,
    vs.description,
    vs.price,
    vs.currency,
    vs.condition,
    vs.status,
    vs.location_lat,
    vs.location_lng,
    vs.created_at,
    vs.updated_at,
    vs.category_id,
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    vs.distance_km
  FROM vector_scored vs
  JOIN users u       ON u.id = vs.user_id
  LEFT JOIN images_agg ia ON ia.item_id = vs.id
  ORDER BY
    vs.similarity_score DESC,
    vs.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_top_picks_for_you IS 'Returns AI-powered item recommendations based on vector similarity to user''s items';

