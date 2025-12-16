-- Migration to fix items with invalid category_ids
-- Assigns valid leaf category IDs to items that have:
-- 1. NULL category_id
-- 2. category_id that doesn't exist in categories table
-- 3. category_id pointing to a non-leaf category (parent category)

BEGIN;

-- Create a function to get a random leaf category ID
CREATE OR REPLACE FUNCTION get_random_leaf_category_id()
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    leaf_category_id UUID;
BEGIN
    -- Get a random active leaf category (category with no children)
    SELECT id INTO leaf_category_id
    FROM public.categories
    WHERE is_active = true
      AND id NOT IN (
        SELECT DISTINCT parent_id 
        FROM public.categories 
        WHERE parent_id IS NOT NULL
      )
    ORDER BY RANDOM()
    LIMIT 1;
    
    RETURN leaf_category_id;
END;
$$;

-- Fix items with invalid category_ids
DO $$
DECLARE
    invalid_count INTEGER;
    null_count INTEGER;
    parent_category_count INTEGER;
    item_record RECORD;
    valid_category_id UUID;
    leaf_categories UUID[];
    category_index INTEGER := 1;
    total_fixed INTEGER := 0;
BEGIN
    -- Count items with different types of invalid category_ids
    SELECT COUNT(*) INTO invalid_count
    FROM public.items i
    LEFT JOIN public.categories c ON i.category_id = c.id
    WHERE i.category_id IS NOT NULL 
      AND c.id IS NULL;
    
    SELECT COUNT(*) INTO null_count
    FROM public.items
    WHERE category_id IS NULL;
    
    -- Count items with parent category IDs (should only use leaf categories)
    SELECT COUNT(*) INTO parent_category_count
    FROM public.items i
    INNER JOIN public.categories c ON i.category_id = c.id
    WHERE i.category_id IS NOT NULL
      AND c.id IN (
        SELECT DISTINCT parent_id 
        FROM public.categories 
        WHERE parent_id IS NOT NULL
      );
    
    RAISE NOTICE 'Found % items with invalid category_ids (non-existent)', invalid_count;
    RAISE NOTICE 'Found % items with NULL category_id', null_count;
    RAISE NOTICE 'Found % items with parent category IDs (should be leaf)', parent_category_count;
    
    -- Get all active leaf categories
    SELECT ARRAY_AGG(id) INTO leaf_categories
    FROM public.categories
    WHERE is_active = true
      AND id NOT IN (
        SELECT DISTINCT parent_id 
        FROM public.categories 
        WHERE parent_id IS NOT NULL
      );
    
    -- Check if we have any leaf categories
    IF leaf_categories IS NULL OR array_length(leaf_categories, 1) IS NULL THEN
        RAISE EXCEPTION 'No active leaf categories found. Cannot fix items.';
    END IF;
    
    RAISE NOTICE 'Found % active leaf categories to use', array_length(leaf_categories, 1);
    
    -- Fix items with invalid category_ids (non-existent)
    IF invalid_count > 0 THEN
        FOR item_record IN 
            SELECT id 
            FROM public.items i
            LEFT JOIN public.categories c ON i.category_id = c.id
            WHERE i.category_id IS NOT NULL 
              AND c.id IS NULL
        LOOP
            -- Cycle through leaf categories for even distribution
            valid_category_id := leaf_categories[category_index];
            category_index := (category_index % array_length(leaf_categories, 1)) + 1;
            
            UPDATE public.items
            SET category_id = valid_category_id,
                updated_at = NOW()
            WHERE id = item_record.id;
            
            total_fixed := total_fixed + 1;
        END LOOP;
        
        RAISE NOTICE 'Fixed % items with invalid category_ids', invalid_count;
    END IF;
    
    -- Fix items with NULL category_id
    IF null_count > 0 THEN
        FOR item_record IN 
            SELECT id 
            FROM public.items
            WHERE category_id IS NULL
        LOOP
            -- Cycle through leaf categories for even distribution
            valid_category_id := leaf_categories[category_index];
            category_index := (category_index % array_length(leaf_categories, 1)) + 1;
            
            UPDATE public.items
            SET category_id = valid_category_id,
                updated_at = NOW()
            WHERE id = item_record.id;
            
            total_fixed := total_fixed + 1;
        END LOOP;
        
        RAISE NOTICE 'Fixed % items with NULL category_id', null_count;
    END IF;
    
    -- Fix items with parent category IDs (replace with leaf categories)
    IF parent_category_count > 0 THEN
        FOR item_record IN 
            SELECT i.id
            FROM public.items i
            INNER JOIN public.categories c ON i.category_id = c.id
            WHERE i.category_id IS NOT NULL
              AND c.id IN (
                SELECT DISTINCT parent_id 
                FROM public.categories 
                WHERE parent_id IS NOT NULL
              )
        LOOP
            -- Cycle through leaf categories for even distribution
            valid_category_id := leaf_categories[category_index];
            category_index := (category_index % array_length(leaf_categories, 1)) + 1;
            
            UPDATE public.items
            SET category_id = valid_category_id,
                updated_at = NOW()
            WHERE id = item_record.id;
            
            total_fixed := total_fixed + 1;
        END LOOP;
        
        RAISE NOTICE 'Fixed % items with parent category IDs', parent_category_count;
    END IF;
    
    RAISE NOTICE 'Total items fixed: %', total_fixed;
    
    IF total_fixed = 0 THEN
        RAISE NOTICE 'No items with invalid category_ids found. Nothing to update.';
    END IF;
END $$;

-- Verify the fix
DO $$
DECLARE
    remaining_invalid INTEGER;
    remaining_null INTEGER;
    remaining_parent INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_invalid
    FROM public.items i
    LEFT JOIN public.categories c ON i.category_id = c.id
    WHERE i.category_id IS NOT NULL 
      AND c.id IS NULL;
    
    SELECT COUNT(*) INTO remaining_null
    FROM public.items
    WHERE category_id IS NULL;
    
    SELECT COUNT(*) INTO remaining_parent
    FROM public.items i
    INNER JOIN public.categories c ON i.category_id = c.id
    WHERE i.category_id IS NOT NULL
      AND c.id IN (
        SELECT DISTINCT parent_id 
        FROM public.categories 
        WHERE parent_id IS NOT NULL
      );
    
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '  Remaining invalid category_ids: %', remaining_invalid;
    RAISE NOTICE '  Remaining NULL category_ids: %', remaining_null;
    RAISE NOTICE '  Remaining parent category_ids: %', remaining_parent;
    
    IF remaining_invalid > 0 OR remaining_null > 0 OR remaining_parent > 0 THEN
        RAISE WARNING 'Some items still have invalid category_ids!';
    ELSE
        RAISE NOTICE 'All items now have valid leaf category_ids!';
    END IF;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS get_random_leaf_category_id();

COMMIT;




