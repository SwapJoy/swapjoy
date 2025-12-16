-- Remove prompt and prompt_embedding columns from users table
-- These are no longer needed for recommendations

-- Drop prompt_embedding column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS prompt_embedding;

-- Drop prompt column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS prompt;

-- Drop any RPC functions that use prompt_embedding
DROP FUNCTION IF EXISTS match_items_to_user_prompt(UUID, INT);

-- Add comment
COMMENT ON TABLE users IS 'User profiles - prompt and prompt_embedding columns removed as of 2025-01-24';




