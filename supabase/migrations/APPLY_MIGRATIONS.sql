-- Combined Migration Script
-- Run this in Supabase SQL Editor to apply both migrations
-- Date: 2025-01-24

-- ============================================================================
-- Migration 1: Create get_top_picks_for_user function
-- ============================================================================

-- Create comprehensive function that combines all queries for getTopPicksForUser
-- This replaces multiple frontend queries with a single database query

CREATE OR REPLACE FUNCTION get_top_picks_for_user(
  p_user_id UUID,
  p_limit INT DEFAULT 10,
  p_user_lat DECIMAL DEFAULT NULL,
  p_user_lng DECIMAL DEFAULT NULL,
  p_radius_km DECIMAL DEFAULT 50.0,
  p_match_threshold FLOAT DEFAULT 0.7,
  p_similarity_weight FLOAT DEFAULT 0.0,
  p_category_score_weight FLOAT DEFAULT 0.9,
  p_price_score_weight FLOAT DEFAULT 0.1,
  p_location_score_weight FLOAT DEFAULT 0.1
)
RETURNS TABLE (
  -- Item fields
  id UUID,
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3),
  condition VARCHAR(50),
  status VARCHAR(50),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- Category fields
  category_id UUID,
  category_title_en VARCHAR(255),
  category_title_ka VARCHAR(255),
  
  -- Currency fields
  currency_rate DECIMAL(10,4),
  
  -- User fields
  user_id UUID,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  profile_image_url TEXT,
  
  -- Image fields (primary image)
  image_url TEXT,
  
  -- Calculated fields
  similarity_score FLOAT,
  distance_km DECIMAL(10,2),
  category_match_score FLOAT,
  price_match_score FLOAT,
  location_match_score FLOAT,
  overall_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_user_items_embedding vector(1536);
  v_user_items_count INT;
  v_avg_user_value_gel DECIMAL(10,2);
  v_favorite_categories UUID[];
  v_total_weight FLOAT;
  v_embedding_sum float[];
  v_emb vector(1536);
  v_dim_idx INT;
  v_emb_array float[];
BEGIN
  -- Get user's items count and average price
  SELECT 
    COUNT(*),
    AVG(price * COALESCE((SELECT rate FROM currencies WHERE code = currency), 1))
  INTO v_user_items_count, v_avg_user_value_gel
  FROM items
  WHERE user_id = p_user_id 
    AND status = 'available' 
    AND embedding IS NOT NULL;
  
  -- Calculate average embedding by averaging each dimension
  IF v_user_items_count > 0 THEN
    -- Initialize sum array
    v_embedding_sum := array_fill(0.0::float, ARRAY[1536]);
    
    -- Sum all embeddings dimension by dimension
    FOR v_emb IN 
      SELECT embedding FROM items
      WHERE user_id = p_user_id 
        AND status = 'available' 
        AND embedding IS NOT NULL
    LOOP
      v_emb_array := v_emb::float[];
      FOR v_dim_idx IN 1..1536 LOOP
        v_embedding_sum[v_dim_idx] := v_embedding_sum[v_dim_idx] + v_emb_array[v_dim_idx];
      END LOOP;
    END LOOP;
    
    -- Divide by count to get average
    FOR v_dim_idx IN 1..1536 LOOP
      v_embedding_sum[v_dim_idx] := v_embedding_sum[v_dim_idx] / v_user_items_count;
    END LOOP;
    
    -- Convert array back to vector
    v_avg_user_items_embedding := v_embedding_sum::vector(1536);
  END IF;
  
  -- Get favorite categories
  SELECT favorite_categories INTO v_favorite_categories
  FROM users WHERE id = p_user_id;
  
  -- If no user items with embeddings, return empty result
  IF v_user_items_count = 0 OR v_avg_user_items_embedding IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculate total weight for normalization
  v_total_weight := p_similarity_weight + p_category_score_weight + p_price_score_weight + p_location_score_weight;
  IF v_total_weight = 0 THEN
    v_total_weight := 1.0; -- Prevent division by zero
  END IF;
  
  -- Main query: combine vector search + location filtering + joins
  RETURN QUERY
  WITH location_filtered AS (
    SELECT 
      i.*,
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
      END AS distance_km
    FROM items i
    WHERE i.status = 'available'
      AND i.user_id != p_user_id
      AND i.embedding IS NOT NULL
      -- Location bounding box filter (fast pre-filter)
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR
        (
          i.location_lat IS NOT NULL 
          AND i.location_lng IS NOT NULL
          AND i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                                 AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                                 AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
  ),
  vector_scored AS (
    SELECT 
      lf.*,
      -- Calculate similarity using average user items embedding
      1 - (lf.embedding <=> v_avg_user_items_embedding) AS similarity_score
    FROM location_filtered lf
    WHERE 
      -- Apply exact Haversine distance filter
      (lf.distance_km IS NULL OR lf.distance_km <= p_radius_km)
      -- Apply similarity threshold
      AND (1 - (lf.embedding <=> v_avg_user_items_embedding) > p_match_threshold)
  )
  SELECT 
    vs.id,
    vs.title,
    vs.description,
    vs.price,
    vs.currency,
    vs.condition,
    vs.status,
    vs.location_lat,
    vs.location_lng,
    vs.created_at,
    vs.updated_at,
    
    -- Category
    c.id AS category_id,
    c.title_en AS category_title_en,
    c.title_ka AS category_title_ka,
    
    -- Currency rate
    cur.rate AS currency_rate,
    
    -- User
    u.id AS user_id,
    u.username,
    u.first_name,
    u.last_name,
    u.profile_image_url,
    
    -- Primary image (first image)
    (SELECT image_url FROM item_images 
     WHERE item_id = vs.id 
     ORDER BY is_primary DESC NULLS LAST, created_at ASC 
     LIMIT 1) AS image_url,
    
    -- Scores
    vs.similarity_score,
    vs.distance_km,
    
    -- Category match score (1.0 if in favorites, 0.0 otherwise)
    CASE 
      WHEN vs.category_id = ANY(v_favorite_categories) THEN 1.0
      ELSE 0.0
    END AS category_match_score,
    
    -- Price match score
    CASE 
      WHEN v_avg_user_value_gel > 0 AND vs.price IS NOT NULL AND cur.rate IS NOT NULL
      THEN GREATEST(0, 1 - ABS((vs.price * cur.rate) - v_avg_user_value_gel) / NULLIF(v_avg_user_value_gel, 0))
      ELSE 0.5
    END AS price_match_score,
    
    -- Location match score (1.0 at user location, 0.0+ at max radius)
    CASE 
      WHEN vs.distance_km IS NOT NULL AND p_radius_km > 0
      THEN GREATEST(0, 1 - (vs.distance_km / p_radius_km))
      ELSE 0.5
    END AS location_match_score,
    
    -- Overall score (weighted combination)
    (
      (vs.similarity_score * p_similarity_weight +
      CASE 
        WHEN vs.category_id = ANY(v_favorite_categories) THEN 1.0 ELSE 0.0
      END * p_category_score_weight +
      CASE 
        WHEN v_avg_user_value_gel > 0 AND vs.price IS NOT NULL AND cur.rate IS NOT NULL
        THEN GREATEST(0, 1 - ABS((vs.price * cur.rate) - v_avg_user_value_gel) / NULLIF(v_avg_user_value_gel, 0))
        ELSE 0.5
      END * p_price_score_weight +
      CASE 
        WHEN vs.distance_km IS NOT NULL AND p_radius_km > 0
        THEN GREATEST(0, 1 - (vs.distance_km / p_radius_km))
        ELSE 0.5
      END * p_location_score_weight) / v_total_weight
    ) AS overall_score
    
  FROM vector_scored vs
  INNER JOIN categories c ON c.id = vs.category_id
  INNER JOIN currencies cur ON cur.code = vs.currency
  INNER JOIN users u ON u.id = vs.user_id
  ORDER BY overall_score DESC
  LIMIT p_limit;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_top_picks_for_user IS 'Combines vector similarity search, location filtering, and scoring into a single query for top picks recommendations';

-- ============================================================================
-- Migration 2: Remove prompt and prompt_embedding from users table
-- ============================================================================

-- Drop prompt_embedding column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS prompt_embedding;

-- Drop prompt column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS prompt;

-- Drop any RPC functions that use prompt_embedding
DROP FUNCTION IF EXISTS match_items_to_user_prompt(UUID, INT);

-- Add comment
COMMENT ON TABLE users IS 'User profiles - prompt and prompt_embedding columns removed as of 2025-01-24';

-- ============================================================================
-- Migration Complete
-- ============================================================================







