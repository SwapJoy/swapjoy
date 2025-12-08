-- Create function to get trending categories
-- This function returns the most popular categories from recent items with sample items from each

SET search_path = public;

CREATE OR REPLACE FUNCTION public.fn_trending_categories(
  p_user_id             uuid,
  p_user_lat            numeric,
  p_user_lng            numeric,
  p_days_interval       int DEFAULT 7,
  p_categories_limit    int DEFAULT 10,
  p_items_per_category  int DEFAULT 5
)
RETURNS TABLE (
  -- category info
  category_id           uuid,
  category_title_en     text,
  category_title_ka     text,
  category_rank         int,
  category_item_count   bigint,

  -- item
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

  -- user
  user_id               uuid,
  username              text,
  first_name            text,
  last_name             text,
  profile_image_url     text,

  -- images
  images                jsonb,

  -- distance
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
  ORDER BY
    il.category_rank ASC,      -- most trending categories first
    il.created_at DESC;        -- newest items inside each category
END;
$$;

COMMENT ON FUNCTION public.fn_trending_categories IS 'Returns trending categories with top items from each category, based on recent activity';

