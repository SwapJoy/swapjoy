-- Update all section functions to include location filtering with radius
-- This migration updates all section functions to:
-- 1. Add p_radius_km parameter (default 50km) where missing
-- 2. Add location filtering (bounding box + exact distance)
-- 3. Fix NearYou sorting to show closer items first

SET search_path = public;

-- ============================================================================
-- 1. Update fn_near_you - Fix sorting to show closer items first
-- ============================================================================

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
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  images            jsonb,
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
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
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      -- fast bounding box pre-filter
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
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
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    iwd.distance_km
  FROM items_with_distance iwd
  JOIN users u       ON u.id = iwd.user_id
  LEFT JOIN images_agg ia ON ia.item_id = iwd.id
  WHERE
    (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
  ORDER BY
    iwd.distance_km ASC NULLS LAST,
    iwd.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_near_you IS 'Returns items near the user based on location proximity, sorted by distance (closest first)';

-- ============================================================================
-- 2. Update fn_fresh_finds - Add radius filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_fresh_finds(
  p_user_id    uuid,
  p_user_lat   numeric,
  p_user_lng   numeric,
  p_radius_km  numeric DEFAULT 50,
  p_limit      int DEFAULT 50
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
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  images            jsonb,
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
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
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      -- fast bounding box pre-filter
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
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
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    iwd.distance_km
  FROM items_with_distance iwd
  JOIN users u       ON u.id = iwd.user_id
  LEFT JOIN images_agg ia ON ia.item_id = iwd.id
  WHERE
    (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
  ORDER BY
    iwd.created_at DESC,
    iwd.distance_km NULLS LAST
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_fresh_finds IS 'Returns the freshest (newest) items sorted by creation date, filtered by location radius';

-- ============================================================================
-- 3. Update fn_favourite_categories - Add radius filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_favourite_categories(
  p_user_id    uuid,
  p_user_lat   numeric,
  p_user_lng   numeric,
  p_radius_km  numeric DEFAULT 50,
  p_limit      int DEFAULT 50
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
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  images            jsonb,
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_favorite_categories uuid[];
BEGIN
  SELECT u.favorite_categories
  INTO v_favorite_categories
  FROM users u
  WHERE u.id = p_user_id;

  IF v_favorite_categories IS NULL
     OR array_length(v_favorite_categories, 1) = 0 THEN
    RETURN;
  END IF;

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
      AND i.category_id = ANY (v_favorite_categories)
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      -- fast bounding box pre-filter
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
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
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    iwd.distance_km
  FROM items_with_distance iwd
  JOIN users u       ON u.id = iwd.user_id
  LEFT JOIN images_agg ia ON ia.item_id = iwd.id
  WHERE
    (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
  ORDER BY
    iwd.created_at DESC,
    iwd.distance_km NULLS LAST
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_favourite_categories IS 'Returns items from the user''s favorite categories, filtered by location radius';

-- ============================================================================
-- 4. Update fn_best_deals - Add radius filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_best_deals(
  p_user_id          uuid,
  p_user_lat         numeric,
  p_user_lng         numeric,
  p_radius_km        numeric DEFAULT 50,
  p_limit            int     DEFAULT 50,
  p_price_tolerance  numeric DEFAULT 0.20
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
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  images            jsonb,
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_recent_items AS (
    SELECT
      ui.id,
      ui.category_id,
      ui.condition,
      ui.price,
      ui.currency,
      ui.created_at,
      (ui.price * COALESCE(ucur.rate, 1))::numeric(10,2) AS price_gel
    FROM items ui
    JOIN currencies ucur ON ucur.code = ui.currency
    WHERE ui.user_id = p_user_id
      AND ui.status = 'available'
      AND ui.category_id IS NOT NULL
      AND ui.condition IS NOT NULL
      AND ui.price IS NOT NULL
      AND ui.price > 0
    ORDER BY ui.created_at DESC
    LIMIT 50
  ),
  candidate_items AS (
    SELECT
      ci.*,
      (ci.price * COALESCE(ccur.rate, 1))::numeric(10,2) AS price_gel,
      CAST(
        CASE 
          WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
           AND ci.location_lat IS NOT NULL AND ci.location_lng IS NOT NULL
          THEN (
            6371 * 2 * ASIN(
              SQRT(
                POWER(SIN(RADIANS(ci.location_lat - p_user_lat) / 2), 2) +
                COS(RADIANS(p_user_lat)) *
                COS(RADIANS(ci.location_lat)) *
                POWER(SIN(RADIANS(ci.location_lng - p_user_lng) / 2), 2)
              )
            )
          )
          ELSE NULL
        END AS numeric(10,2)
      ) AS distance_km
    FROM items ci
    JOIN currencies ccur ON ccur.code = ci.currency
    WHERE ci.status = 'available'
      AND ci.user_id <> p_user_id
      AND ci.category_id IS NOT NULL
      AND ci.condition IS NOT NULL
      AND ci.price IS NOT NULL
      AND ci.price > 0
      AND ci.location_lat IS NOT NULL
      AND ci.location_lng IS NOT NULL
      -- fast bounding box pre-filter
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL OR
        (
          ci.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND ci.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
  ),
  matched_deals AS (
    SELECT DISTINCT ON (ci.id)
      ci.*,
      uri.created_at AS user_item_created_at,
      CASE
        WHEN uri.price_gel > 0
        THEN ABS(ci.price_gel - uri.price_gel) / uri.price_gel
        ELSE NULL
      END AS price_diff_pct
    FROM candidate_items ci
    JOIN user_recent_items uri ON 
      ci.category_id = uri.category_id
      AND ci.condition = uri.condition
      AND ci.price_gel >= uri.price_gel * (1 - p_price_tolerance)
      AND ci.price_gel <= uri.price_gel * (1 + p_price_tolerance)
    ORDER BY ci.id, uri.created_at DESC
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
    md.id,
    md.title,
    md.description,
    md.price,
    md.currency,
    md.condition,
    md.status,
    md.location_lat,
    md.location_lng,
    md.created_at,
    md.updated_at,
    md.category_id,
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    md.distance_km
  FROM matched_deals md
  JOIN users u ON u.id = md.user_id
  LEFT JOIN images_agg ia ON ia.item_id = md.id
  WHERE
    (md.distance_km IS NULL OR md.distance_km <= p_radius_km)
  ORDER BY
    md.user_item_created_at DESC,
    md.price_diff_pct ASC,
    md.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_best_deals IS 'Returns items matching user''s recently added items, filtered by location radius';

-- ============================================================================
-- 5. Update fn_top_picks_for_you - Ensure radius filtering (change default from NULL to 50)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_top_picks_for_you(
  p_user_id         uuid,
  p_user_lat        numeric,
  p_user_lng        numeric,
  p_radius_km       numeric DEFAULT 50,
  p_limit           int     DEFAULT 50,
  p_match_threshold float   DEFAULT 0.2
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
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  images            jsonb,
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_items_embedding vector(1536);
  v_user_items_count     int;
BEGIN
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

  IF v_user_items_count = 0 OR v_user_items_embedding IS NULL THEN
    RETURN;
  END IF;

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
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      -- fast bounding box pre-filter
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
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
      (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
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

COMMENT ON FUNCTION public.fn_top_picks_for_you IS 'Returns AI-powered item recommendations, filtered by location radius';

-- ============================================================================
-- 6. Update fn_trending_categories - Add radius filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_trending_categories(
  p_user_id             uuid,
  p_user_lat            numeric,
  p_user_lng            numeric,
  p_radius_km           numeric DEFAULT 50,
  p_days_interval       int DEFAULT 7,
  p_categories_limit    int DEFAULT 10,
  p_items_per_category  int DEFAULT 5
)
RETURNS TABLE (
  category_id           uuid,
  category_title_en     text,
  category_title_ka     text,
  category_rank         int,
  category_item_count   bigint,
  id                    uuid,
  title                 varchar(200),
  description           text,
  price                 numeric(10,2),
  currency              varchar(3),
  condition             varchar(50),
  status                varchar(50),
  location_lat          numeric(10,8),
  location_lng          numeric(11,8),
  created_at            timestamp without time zone,
  updated_at            timestamp without time zone,
  user_id               uuid,
  username              text,
  first_name            text,
  last_name             text,
  profile_image_url     text,
  images                jsonb,
  distance_km           numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH recent_items AS (
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
      AND i.created_at >= (NOW() - (p_days_interval || ' days')::interval)
      AND i.category_id IS NOT NULL
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      -- fast bounding box pre-filter
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
  ),
  category_stats AS (
    SELECT
      ri.category_id,
      COUNT(*) AS item_count
    FROM recent_items ri
    GROUP BY ri.category_id
  ),
  top_categories AS (
    SELECT
      cs.category_id,
      cs.item_count,
      DENSE_RANK() OVER (ORDER BY cs.item_count DESC)::int AS category_rank
    FROM category_stats cs
    ORDER BY cs.item_count DESC
    LIMIT p_categories_limit
  ),
  items_limited AS (
    SELECT
      ri.*,
      tc.item_count,
      tc.category_rank,
      ROW_NUMBER() OVER (
        PARTITION BY ri.category_id
        ORDER BY ri.created_at DESC
      ) AS rn
    FROM recent_items ri
    JOIN top_categories tc ON tc.category_id = ri.category_id
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
    il.category_id,
    c.title_en::text,
    c.title_ka::text,
    il.category_rank,
    il.item_count,
    il.id,
    il.title,
    il.description,
    il.price,
    il.currency,
    il.condition,
    il.status,
    il.location_lat,
    il.location_lng,
    il.created_at,
    il.updated_at,
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    il.distance_km
  FROM items_limited il
  JOIN categories c    ON c.id = il.category_id
  JOIN users u         ON u.id = il.user_id
  LEFT JOIN images_agg ia ON ia.item_id = il.id
  WHERE il.rn <= p_items_per_category
    AND (il.distance_km IS NULL OR il.distance_km <= p_radius_km)
  ORDER BY
    il.category_rank ASC,
    il.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.fn_trending_categories IS 'Returns trending categories with items filtered by location radius';

-- ============================================================================
-- 7. Update fn_budget_picks - Add radius filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_budget_picks(
  p_user_id    uuid,
  p_user_lat   numeric,
  p_user_lng   numeric,
  p_radius_km  numeric DEFAULT 50,
  p_limit      int     DEFAULT 50,
  p_price_percentile numeric DEFAULT 0.5
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
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  images            jsonb,
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH category_price_stats AS (
    SELECT
      i.category_id,
      PERCENTILE_CONT(p_price_percentile) WITHIN GROUP (
        ORDER BY (i.price * COALESCE(cur.rate, 1))
      ) AS threshold_price_gel
    FROM items i
    JOIN currencies cur ON cur.code = i.currency
    WHERE i.status = 'available'
      AND i.category_id IS NOT NULL
      AND i.price IS NOT NULL
      AND i.price > 0
    GROUP BY i.category_id
  ),
  items_with_distance AS (
    SELECT
      i.*,
      cur.rate,
      (i.price * COALESCE(cur.rate, 1))::numeric(10,2) AS price_gel,
      cps.threshold_price_gel,
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
    JOIN currencies cur ON cur.code = i.currency
    JOIN category_price_stats cps ON cps.category_id = i.category_id
    WHERE i.status = 'available'
      AND i.user_id <> p_user_id
      AND i.category_id IS NOT NULL
      AND i.price IS NOT NULL
      AND i.price > 0
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      AND (i.price * COALESCE(cur.rate, 1)) <= cps.threshold_price_gel
      -- fast bounding box pre-filter
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR p_radius_km IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
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
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    iwd.distance_km
  FROM items_with_distance iwd
  JOIN users u       ON u.id = iwd.user_id
  LEFT JOIN images_agg ia ON ia.item_id = iwd.id
  WHERE
    (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
  ORDER BY
    iwd.price_gel ASC,
    iwd.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_budget_picks IS 'Returns budget-friendly items filtered by location radius';

