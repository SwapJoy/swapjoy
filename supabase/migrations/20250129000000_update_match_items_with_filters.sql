-- Update match_items function to support filter criteria
-- This migration adds price, category, distance, and location filters
-- and makes query_embedding nullable for filter-only searches

CREATE OR REPLACE FUNCTION match_items(
  query_embedding vector(1536) DEFAULT NULL,  -- Nullable: if null, skip semantic similarity matching
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  min_price float DEFAULT 0,  -- Renamed from min_value to min_price for clarity
  exclude_user_id uuid DEFAULT NULL,
  max_price float DEFAULT NULL,  -- NULL means no upper limit
  category_ids uuid[] DEFAULT ARRAY[]::uuid[],  -- Empty array means no category filter
  distance_km float DEFAULT NULL,  -- NULL means no distance filter
  user_lat float DEFAULT NULL,
  user_lng float DEFAULT NULL
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
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.description,
    i.price,
    i.currency,
    i.condition,
    i.category_id,
    i.user_id,
    CASE 
      WHEN query_embedding IS NOT NULL THEN 1 - (i.embedding <=> query_embedding)
      ELSE NULL::float
    END AS similarity
  FROM items i
  WHERE 
    i.status = 'available'
    AND (exclude_user_id IS NULL OR i.user_id != exclude_user_id)
    -- Price filter
    AND i.price >= min_price
    AND (max_price IS NULL OR i.price <= max_price)
    -- Category filter (empty array means no filter)
    AND (array_length(category_ids, 1) IS NULL OR i.category_id = ANY(category_ids))
    -- Semantic similarity filter (only if query_embedding is provided)
    AND (query_embedding IS NULL OR (
      i.embedding IS NOT NULL 
      AND (1 - (i.embedding <=> query_embedding)) >= match_threshold
    ))
    -- Distance filter (only if distance_km and coordinates are provided)
    AND (
      distance_km IS NULL 
      OR user_lat IS NULL 
      OR user_lng IS NULL
      OR i.location_lat IS NULL
      OR i.location_lng IS NULL
      OR (
        -- Haversine formula for distance calculation (in kilometers)
        6371 * acos(
          LEAST(1.0, 
            cos(radians(user_lat)) * 
            cos(radians(i.location_lat)) * 
            cos(radians(i.location_lng) - radians(user_lng)) + 
            sin(radians(user_lat)) * 
            sin(radians(i.location_lat))
          )
        )
      ) <= distance_km
    )
  ORDER BY 
    CASE 
      WHEN query_embedding IS NOT NULL THEN i.embedding <=> query_embedding
      ELSE NULL
    END NULLS LAST,
    i.created_at DESC  -- When no semantic search, order by most recent
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
-- Update the function signature in GRANT statement
GRANT EXECUTE ON FUNCTION match_items(vector, float, int, float, uuid, float, uuid[], float, float, float) TO authenticated;

-- Update comment
COMMENT ON FUNCTION match_items IS 'Performs semantic similarity search on items using vector embeddings with optional filter criteria (price, categories, distance, location). Returns items sorted by similarity score when query_embedding is provided, or by created_at DESC for filter-only searches.';
