-- Select items with their location coordinates and nearest city name
SELECT 
    i.id, 
    i.title, 
    c.title_ka,
    i.images,
    city_data.name AS city_name
FROM items i
INNER JOIN categories c ON i.category_id = c.id
LEFT JOIN LATERAL public.find_nearest_city(i.location_lat, i.location_lng) AS city_data ON true
WHERE i.location_lat IS NOT NULL 
  AND i.location_lng IS NOT NULL
ORDER BY i.created_at DESC;
