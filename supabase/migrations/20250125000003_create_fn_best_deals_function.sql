-- Create function to get best deals (items matching user's recently added items)
-- This function finds items that match the user's recently added items by:
-- - Same category
-- - Same condition
-- - Price within 20% difference (converted to GEL)

SET search_path = public;

CREATE OR REPLACE FUNCTION public.fn_best_deals(
  p_user_id          uuid,
  p_user_lat         numeric,
  p_user_lng         numeric,
  p_radius_km        numeric DEFAULT 50,
  p_limit            int     DEFAULT 50,
  p_price_tolerance  numeric DEFAULT 0.20   -- 20% price difference tolerance
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
  -- distance (optional, for UI)
  distance_km       numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_recent_items AS (
    -- Get user's recently added items, sorted by created_at DESC
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
    LIMIT 50  -- Consider last 50 user items for matching
  ),
  candidate_items AS (
    -- Get all available items from other users with price converted to GEL
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
    -- Match candidate items to user's recent items
    SELECT DISTINCT ON (ci.id)
      ci.*,
      uri.created_at AS user_item_created_at,
      -- Calculate price difference percentage for sorting
      CASE
        WHEN uri.price_gel > 0
        THEN ABS(ci.price_gel - uri.price_gel) / uri.price_gel
        ELSE NULL
      END AS price_diff_pct
    FROM candidate_items ci
    JOIN user_recent_items uri ON 
      -- Match by category (strict)
      ci.category_id = uri.category_id
      -- Match by condition (strict)
      AND ci.condition = uri.condition
      -- Match by price within tolerance (20% default)
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
    md.user_item_created_at DESC,  -- Most recent user items first
    md.price_diff_pct ASC,         -- Closest price matches first
    md.created_at DESC             -- Newest matches first
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_best_deals IS 'Returns items matching user''s recently added items by category, condition, and price (within 20% tolerance), sorted by recency';

