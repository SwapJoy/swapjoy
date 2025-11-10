-- Find the nearest active city to the given coordinates
CREATE OR REPLACE FUNCTION public.find_nearest_city(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    country TEXT,
    state_province TEXT,
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
WITH input_point AS (
    SELECT ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography AS geom
)
SELECT
    c.id,
    c.name,
    c.country,
    c.state_province,
    c.center_lat,
    c.center_lng,
    ST_Distance(
        ST_SetSRID(ST_MakePoint(c.center_lng, c.center_lat), 4326)::geography,
        input_point.geom
    ) / 1000 AS distance_km
FROM public.cities c,
     input_point
WHERE c.is_active IS DISTINCT FROM FALSE
ORDER BY distance_km
LIMIT 1;
$$;

COMMENT ON FUNCTION public.find_nearest_city(DOUBLE PRECISION, DOUBLE PRECISION)
IS 'Returns the nearest active city to the provided coordinates.';

-- Filter item ids by distance from a point (optionally constrained to a subset)
CREATE OR REPLACE FUNCTION public.filter_items_by_radius(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION,
    p_item_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    item_id UUID,
    distance_km DOUBLE PRECISION,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
WITH input_point AS (
    SELECT ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography AS geom
),
items_with_points AS (
    SELECT
        i.id,
        i.location_lat,
        i.location_lng,
        ST_SetSRID(ST_MakePoint(i.location_lng, i.location_lat), 4326)::geography AS geom
    FROM public.items i
    WHERE i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      AND (p_item_ids IS NULL OR i.id = ANY(p_item_ids))
)
SELECT
    iwp.id AS item_id,
    ST_Distance(iwp.geom, input_point.geom) / 1000 AS distance_km,
    iwp.location_lat,
    iwp.location_lng
FROM items_with_points iwp,
     input_point
WHERE p_radius_km IS NULL
   OR ST_DWithin(iwp.geom, input_point.geom, p_radius_km * 1000);
$$;

COMMENT ON FUNCTION public.filter_items_by_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, UUID[])
IS 'Returns item ids within the given radius (km) of the provided point.';

