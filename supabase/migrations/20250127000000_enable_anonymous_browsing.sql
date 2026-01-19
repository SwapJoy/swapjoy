-- Enable anonymous browsing for listings
-- This migration updates RLS policies to allow anonymous users to read items, item_images, and categories

-- Update items SELECT policy to allow anonymous users
DROP POLICY IF EXISTS "Items are viewable by everyone" ON items;
CREATE POLICY "Items are viewable by everyone including anonymous"
  ON items FOR SELECT
  USING (status = 'available');

-- Verify item_images policy allows anonymous (should already be true)
-- The existing policy "Item images are viewable by everyone" should work, but let's ensure it's correct
DROP POLICY IF EXISTS "Item images are viewable by everyone" ON item_images;
CREATE POLICY "Item images are viewable by everyone including anonymous"
  ON item_images FOR SELECT
  USING (true);

-- Ensure categories are viewable by anonymous users
-- Check if categories table has RLS enabled and add policy if needed
DO $$
BEGIN
  -- Enable RLS on categories if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'categories'
  ) THEN
    RAISE NOTICE 'Categories table does not exist, skipping RLS setup';
  ELSE
    -- Enable RLS if not already enabled
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
    DROP POLICY IF EXISTS "Categories are viewable by everyone including anonymous" ON categories;
    
    -- Create policy to allow anonymous reads
    CREATE POLICY "Categories are viewable by everyone including anonymous"
      ON categories FOR SELECT
      USING (is_active = true OR is_active IS NULL);
  END IF;
END $$;

-- Note: Anonymous users can only READ data
-- INSERT, UPDATE, DELETE operations still require authentication
-- This is enforced by the existing policies that check auth.uid()







