-- Create match_items function for semantic search
-- This function performs vector similarity search on item embeddings

CREATE OR REPLACE FUNCTION match_items(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  min_value float DEFAULT 0,
  exclude_user_id uuid DEFAULT NULL
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
    1 - (i.embedding <=> query_embedding) AS similarity
  FROM items i
  WHERE 
    i.embedding IS NOT NULL
    AND i.status = 'available'
    AND (exclude_user_id IS NULL OR i.user_id != exclude_user_id)
    AND (1 - (i.embedding <=> query_embedding)) >= match_threshold
    AND (1 - (i.embedding <=> query_embedding)) >= min_value
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_items(vector, float, int, float, uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION match_items IS 'Performs semantic similarity search on items using vector embeddings. Returns items sorted by similarity score.';

