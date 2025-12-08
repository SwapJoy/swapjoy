-- Create function to get items from user's favorite categories
-- This function returns items matching the user's favorite categories

SET search_path = public;

CREATE OR REPLACE FUNCTION public.fn_favourite_categories(
  p_user_id    uuid,
  p_user_lat   numeric,
  p_user_lng   numeric,
  p_limit      int DEFAULT 50
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
DECLARE
  v_favorite_categories uuid[];
BEGIN
  -- 1) Load user's favorite categories
  SELECT u.favorite_categories
  INTO v_favorite_categories
  FROM users u
  WHERE u.id = p_user_id;

  -- 2) If no favorites, return empty
  IF v_favorite_categories IS NULL
     OR array_length(v_favorite_categories, 1) = 0 THEN
    RETURN;
  END IF;

  -- 3) Main query - only use exact favorite categories (no recursive descendants)
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
  ORDER BY
    iwd.created_at DESC,
    iwd.distance_km NULLS LAST
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_favourite_categories IS 'Returns items from the user''s favorite categories, sorted by creation date and distance';

