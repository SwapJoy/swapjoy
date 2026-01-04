-- Update item titles to append city name based on location coordinates
-- Format: Title -> Title_city
-- Example: Guitar -> Guitar_Tbilisi

WITH items_with_cities AS (
    SELECT 
        i.id,
        i.title,
        i.location_lat,
        i.location_lng,
        city_data.name AS city_name
    FROM items i
    CROSS JOIN LATERAL public.find_nearest_city(i.location_lat, i.location_lng) AS city_data
    WHERE i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      AND city_data.name IS NOT NULL
      AND i.title IS NOT NULL
      -- Only update if title doesn't already end with the city name (idempotent check)
      AND i.title NOT LIKE '%\_' || city_data.name
      -- Ensure we don't exceed VARCHAR(255) limit
      AND LENGTH(i.title || '_' || city_data.name) <= 255
)
UPDATE items i
SET title = iwc.title || '_' || iwc.city_name
FROM items_with_cities iwc
WHERE i.id = iwc.id;

