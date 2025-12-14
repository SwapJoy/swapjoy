-- Ensure fn_mostly_viewed function exists and is properly exposed
-- This is a standalone migration to fix the function if it wasn't created properly

SET search_path = public;

-- Drop and recreate to ensure it's properly registered
DROP FUNCTION IF EXISTS public.fn_mostly_viewed(uuid, numeric, numeric, numeric, int);

CREATE OR REPLACE FUNCTION public.fn_mostly_viewed(
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
  distance_km       numeric(10,2),
  view_count        integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    iwd.distance_km,
    COALESCE(im.view_count, 0)::integer AS view_count
  FROM items_with_distance iwd
  JOIN users u ON u.id = iwd.user_id
  LEFT JOIN images_agg ia ON ia.item_id = iwd.id
  LEFT JOIN item_metrics im ON im.item_id = iwd.id
  WHERE
    (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
    AND COALESCE(im.view_count, 0) > 0  -- Only show items with at least 1 view
  ORDER BY
    COALESCE(im.view_count, 0) DESC,
    iwd.created_at DESC,
    iwd.distance_km NULLS LAST
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.fn_mostly_viewed IS 'Returns the most viewed items sorted by view count, filtered by location radius';

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.fn_mostly_viewed(uuid, numeric, numeric, numeric, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_mostly_viewed(uuid, numeric, numeric, numeric, int) TO anon;

