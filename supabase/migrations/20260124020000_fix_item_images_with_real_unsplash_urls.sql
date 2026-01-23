-- Fix all existing items with real Unsplash image URLs
-- Using direct Unsplash image URLs with specific photo IDs

DO $$
DECLARE
  v_item record;
  v_category_title text;
  v_image_url text;
  v_updated_count int := 0;
BEGIN
  -- Loop through all items and update their images based on category
  FOR v_item IN 
    SELECT i.id, i.category_id, c.title_en, c.title_ka
    FROM public.items i
    LEFT JOIN public.categories c ON c.id = i.category_id
  LOOP
    v_category_title := COALESCE(v_item.title_en, v_item.title_ka, 'Item');
    
    -- Generate category-appropriate image URL using direct Unsplash image URLs
    -- Using specific photo IDs from Unsplash that match each category
    v_image_url := CASE
      WHEN LOWER(v_category_title) LIKE '%guitar%' OR LOWER(v_category_title) LIKE '%bass%' THEN 
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%piano%' OR LOWER(v_category_title) LIKE '%keyboard%' THEN 
        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%drum%' THEN 
        'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%phone%' OR LOWER(v_category_title) LIKE '%smartphone%' THEN 
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%laptop%' OR LOWER(v_category_title) LIKE '%notebook%' THEN 
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%tablet%' OR LOWER(v_category_title) LIKE '%ipad%' THEN 
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%camera%' OR LOWER(v_category_title) LIKE '%photo%' THEN 
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%headphone%' OR LOWER(v_category_title) LIKE '%earphone%' THEN 
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%bike%' OR LOWER(v_category_title) LIKE '%bicycle%' THEN 
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%motorcycle%' OR LOWER(v_category_title) LIKE '%scooter%' THEN 
        'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%fitness%' OR LOWER(v_category_title) LIKE '%gym%' THEN 
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%sport%' OR LOWER(v_category_title) LIKE '%football%' OR LOWER(v_category_title) LIKE '%soccer%' THEN 
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%clothing%' OR LOWER(v_category_title) LIKE '%clothes%' OR LOWER(v_category_title) LIKE '%fashion%' THEN 
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%watch%' OR LOWER(v_category_title) LIKE '%timepiece%' THEN 
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%furniture%' OR LOWER(v_category_title) LIKE '%sofa%' OR LOWER(v_category_title) LIKE '%chair%' THEN 
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%appliance%' OR LOWER(v_category_title) LIKE '%kitchen%' THEN 
        'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%book%' THEN 
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%game%' OR LOWER(v_category_title) LIKE '%console%' THEN 
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop'
      WHEN LOWER(v_category_title) LIKE '%tool%' OR LOWER(v_category_title) LIKE '%equipment%' THEN 
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'
      ELSE 
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'
    END;
    
    -- Update the item's images jsonb
    UPDATE public.items
    SET images = jsonb_build_array(
      jsonb_build_object('url', v_image_url, 'order', 0)
    )
    WHERE id = v_item.id;
    
    v_updated_count := v_updated_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Updated images for % items with real Unsplash URLs', v_updated_count;
END;
$$;
