-- Script to fix items with invalid category_ids
-- Updates items that have category_ids that don't exist in the categories table
-- Assigns random valid category_ids from the categories table (each item gets a different random category)

BEGIN;

-- First, let's see how many items have invalid category_ids
DO $$
DECLARE
    invalid_count INTEGER;
    item_record RECORD;
    valid_category_id UUID;
BEGIN
    -- Count items with invalid category_ids
    SELECT COUNT(*) INTO invalid_count
    FROM public.items i
    LEFT JOIN public.categories c ON i.category_id = c.id
    WHERE i.category_id IS NOT NULL 
      AND c.id IS NULL;
    
    RAISE NOTICE 'Found % items with invalid category_ids', invalid_count;
    
    -- If there are invalid category_ids, update them
    IF invalid_count > 0 THEN
        -- Update each item individually with a different random valid category_id
        FOR item_record IN 
            SELECT id 
            FROM public.items i
            LEFT JOIN public.categories c ON i.category_id = c.id
            WHERE i.category_id IS NOT NULL 
              AND c.id IS NULL
        LOOP
            -- Get a random valid category_id for this item
            SELECT id INTO valid_category_id
            FROM public.categories 
            ORDER BY RANDOM() 
            LIMIT 1;
            
            -- Update this specific item
            UPDATE public.items
            SET category_id = valid_category_id,
                updated_at = NOW()
            WHERE id = item_record.id;
        END LOOP;
        
        RAISE NOTICE 'Updated % items with valid random category_ids', invalid_count;
    ELSE
        RAISE NOTICE 'No items with invalid category_ids found. Nothing to update.';
    END IF;
END $$;

-- Verify the fix
SELECT 
    COUNT(*) as remaining_invalid
FROM public.items i
LEFT JOIN public.categories c ON i.category_id = c.id
WHERE i.category_id IS NOT NULL 
  AND c.id IS NULL;

COMMIT;

