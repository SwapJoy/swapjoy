-- Search RPC for Marketplace search flow
-- Supports free-text query, categories, condition, price, and distance filters.

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
  calculated_distance_km numeric(10,2)
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
    END AS calculated_distance_km
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

COMMENT ON FUNCTION public.search_items IS 'Searches available items with full-text + ilike query matching and filters for categories, conditions, price, and distance. Returns denormalized listing payload with pagination.';
