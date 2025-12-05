-- Add meta JSONB column to item_images table for storing image analysis results
ALTER TABLE item_images 
ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT NULL;

-- Add GIN index for efficient querying of meta data
CREATE INDEX IF NOT EXISTS idx_item_images_meta ON item_images USING gin (meta);

