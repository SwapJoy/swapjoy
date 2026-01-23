-- Test query to verify location filtering works
-- Batumi coordinates: 41.6168, 41.6367
-- Tbilisi coordinates: 41.7151, 44.8271
-- Distance between them: ~350km

-- Test 1: Check items and their distances from Batumi
WITH batumi_point AS (
  SELECT ST_SetSRID(ST_MakePoint(41.6367, 41.6168), 4326)::geography AS geom
)
SELECT 
  i.id,
  i.title,
  i.location_lat,
  i.location_lng,
  i.geo IS NOT NULL as has_geo,
  CASE 
    WHEN i.geo IS NOT NULL THEN
      ST_Distance(i.geo, batumi_point.geom) / 1000.0
    ELSE NULL
  END as distance_km_from_batumi,
  CASE 
    WHEN i.geo IS NOT NULL THEN
      ST_DWithin(i.geo, batumi_point.geom, 50.0 * 1000.0)
    ELSE false
  END as within_50km
FROM items i
CROSS JOIN batumi_point
WHERE i.status = 'available'
ORDER BY distance_km_from_batumi NULLS LAST
LIMIT 20;

-- Test 2: Call the actual function with Batumi coordinates
-- Replace 'USER_ID_HERE' with actual user ID
SELECT * FROM get_top_picks_for_user(
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with actual user ID
  20,
  41.6168,  -- Batumi lat
  41.6367,  -- Batumi lng
  50.0,     -- 50km radius
  0
);
