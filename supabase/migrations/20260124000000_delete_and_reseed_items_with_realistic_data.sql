-- Delete all existing items and generate 500 new realistic items
-- Items will have proper titles matching categories and real images

DO $$
DECLARE
  v_count int := 0;
  v_user uuid;
  v_category record;
  v_city record;
  v_conditions text[] := ARRAY['new','like_new','good','fair','poor'];
  v_condition text;
  v_currencies text[] := ARRAY['GEL','USD','EUR'];
  v_currency text;
  v_title text;
  v_image_url text;
  v_category_title text;
BEGIN
  -- Delete all existing items
  DELETE FROM public.items;
  RAISE NOTICE 'Deleted all existing items';

  -- Ensure we have users and active categories
  IF (SELECT count(*) FROM public.users) = 0 THEN
    RAISE NOTICE 'Skipping seed: no users in public.users';
    RETURN;
  END IF;

  IF (SELECT count(*) FROM public.categories WHERE is_active = true) = 0 THEN
    RAISE NOTICE 'Skipping seed: no active categories in public.categories';
    RETURN;
  END IF;

  IF (SELECT count(*) FROM public.cities) = 0 THEN
    RAISE NOTICE 'Skipping seed: no cities in public.cities';
    RETURN;
  END IF;

  -- Category-specific title and image mappings
  -- Using Unsplash source images with category-specific searches
  WHILE v_count < 500 LOOP
    -- Pick random user and city
    SELECT id INTO v_user FROM public.users ORDER BY random() LIMIT 1;
    SELECT id, center_lat, center_lng INTO v_city FROM public.cities ORDER BY random() LIMIT 1;
    
    -- Pick random active category
    SELECT id, title_en, title_ka INTO v_category 
    FROM public.categories 
    WHERE is_active = true 
    ORDER BY random() 
    LIMIT 1;

    v_category_title := COALESCE(v_category.title_en, v_category.title_ka, 'Item');
    
    -- Generate realistic title based on category
    -- Using category name + brand/model variations
    v_title := CASE 
      -- Musical Instruments
      WHEN LOWER(v_category_title) LIKE '%guitar%' OR LOWER(v_category_title) LIKE '%bass%' THEN
        (ARRAY['Guitar ESP LTD', 'Fender Stratocaster', 'Gibson Les Paul', 'Yamaha Acoustic', 'Ibanez Electric', 'Epiphone Guitar', 'Squier Telecaster'])[1 + floor(random() * 7)::int]
      WHEN LOWER(v_category_title) LIKE '%piano%' OR LOWER(v_category_title) LIKE '%keyboard%' THEN
        (ARRAY['Yamaha Digital Piano', 'Casio Keyboard', 'Roland Synthesizer', 'Korg Workstation'])[1 + floor(random() * 4)::int]
      WHEN LOWER(v_category_title) LIKE '%drum%' THEN
        (ARRAY['Pearl Drum Set', 'Yamaha Electronic Drums', 'Zildjian Cymbals', 'DW Drum Kit'])[1 + floor(random() * 4)::int]
      -- Electronics
      WHEN LOWER(v_category_title) LIKE '%phone%' OR LOWER(v_category_title) LIKE '%smartphone%' THEN
        (ARRAY['iPhone 14 Pro', 'Samsung Galaxy S23', 'Google Pixel 7', 'OnePlus 11', 'Xiaomi 13'])[1 + floor(random() * 5)::int]
      WHEN LOWER(v_category_title) LIKE '%laptop%' OR LOWER(v_category_title) LIKE '%notebook%' THEN
        (ARRAY['MacBook Pro M2', 'Dell XPS 15', 'Lenovo ThinkPad', 'HP Spectre', 'ASUS ROG'])[1 + floor(random() * 5)::int]
      WHEN LOWER(v_category_title) LIKE '%tablet%' OR LOWER(v_category_title) LIKE '%ipad%' THEN
        (ARRAY['iPad Pro 12.9"', 'Samsung Galaxy Tab', 'Microsoft Surface Pro', 'iPad Air'])[1 + floor(random() * 4)::int]
      WHEN LOWER(v_category_title) LIKE '%camera%' OR LOWER(v_category_title) LIKE '%photo%' THEN
        (ARRAY['Canon EOS R5', 'Nikon D850', 'Sony A7III', 'Fujifilm X-T4', 'GoPro Hero 11'])[1 + floor(random() * 5)::int]
      WHEN LOWER(v_category_title) LIKE '%headphone%' OR LOWER(v_category_title) LIKE '%earphone%' THEN
        (ARRAY['Sony WH-1000XM5', 'AirPods Pro', 'Bose QuietComfort', 'Sennheiser HD 650'])[1 + floor(random() * 4)::int]
      -- Vehicles
      WHEN LOWER(v_category_title) LIKE '%bike%' OR LOWER(v_category_title) LIKE '%bicycle%' THEN
        (ARRAY['Trek Mountain Bike', 'Specialized Road Bike', 'Giant Hybrid Bike', 'Cannondale Gravel'])[1 + floor(random() * 4)::int]
      WHEN LOWER(v_category_title) LIKE '%motorcycle%' OR LOWER(v_category_title) LIKE '%scooter%' THEN
        (ARRAY['Honda CBR 600', 'Yamaha R1', 'Kawasaki Ninja', 'Vespa Scooter'])[1 + floor(random() * 4)::int]
      -- Sports & Fitness
      WHEN LOWER(v_category_title) LIKE '%fitness%' OR LOWER(v_category_title) LIKE '%gym%' THEN
        (ARRAY['Adjustable Dumbbells', 'Yoga Mat Premium', 'Resistance Bands Set', 'Kettlebell 20kg'])[1 + floor(random() * 4)::int]
      WHEN LOWER(v_category_title) LIKE '%sport%' OR LOWER(v_category_title) LIKE '%football%' OR LOWER(v_category_title) LIKE '%soccer%' THEN
        (ARRAY['Nike Football Boots', 'Adidas Soccer Ball', 'Puma Training Kit', 'Wilson Tennis Racket'])[1 + floor(random() * 4)::int]
      -- Fashion & Clothing
      WHEN LOWER(v_category_title) LIKE '%clothing%' OR LOWER(v_category_title) LIKE '%clothes%' OR LOWER(v_category_title) LIKE '%fashion%' THEN
        (ARRAY['Nike Air Max Shoes', 'Levi''s Denim Jacket', 'Zara Winter Coat', 'Adidas Sneakers'])[1 + floor(random() * 4)::int]
      WHEN LOWER(v_category_title) LIKE '%watch%' OR LOWER(v_category_title) LIKE '%timepiece%' THEN
        (ARRAY['Apple Watch Series 9', 'Rolex Submariner', 'Omega Seamaster', 'Casio G-Shock'])[1 + floor(random() * 4)::int]
      -- Home & Furniture
      WHEN LOWER(v_category_title) LIKE '%furniture%' OR LOWER(v_category_title) LIKE '%sofa%' OR LOWER(v_category_title) LIKE '%chair%' THEN
        (ARRAY['IKEA Sofa Bed', 'Ergonomic Office Chair', 'Modern Dining Table', 'Leather Recliner'])[1 + floor(random() * 4)::int]
      WHEN LOWER(v_category_title) LIKE '%appliance%' OR LOWER(v_category_title) LIKE '%kitchen%' THEN
        (ARRAY['KitchenAid Mixer', 'Dyson Vacuum Cleaner', 'Instant Pot Pro', 'Nespresso Coffee Machine'])[1 + floor(random() * 4)::int]
      -- Books & Media
      WHEN LOWER(v_category_title) LIKE '%book%' THEN
        (ARRAY['The Great Gatsby', '1984 by George Orwell', 'Harry Potter Collection', 'Sapiens Hardcover'])[1 + floor(random() * 4)::int]
      WHEN LOWER(v_category_title) LIKE '%game%' OR LOWER(v_category_title) LIKE '%console%' THEN
        (ARRAY['PlayStation 5', 'Xbox Series X', 'Nintendo Switch OLED', 'Steam Deck'])[1 + floor(random() * 4)::int]
      -- Tools & Equipment
      WHEN LOWER(v_category_title) LIKE '%tool%' OR LOWER(v_category_title) LIKE '%equipment%' THEN
        (ARRAY['DeWalt Power Drill', 'Bosch Circular Saw', 'Makita Impact Driver', 'Milwaukee Tool Set'])[1 + floor(random() * 4)::int]
      -- Default fallback
      ELSE v_category_title || ' - Premium Quality'
    END;

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

    -- Random condition and currency
    v_condition := v_conditions[1 + floor(random() * array_length(v_conditions, 1))::int];
    v_currency := v_currencies[1 + floor(random() * array_length(v_currencies, 1))::int];

    -- Insert item with proper images jsonb structure
    INSERT INTO public.items (
      user_id,
      title,
      description,
      category_id,
      condition,
      price,
      currency,
      status,
      location_lat,
      location_lng,
      images,
      created_at,
      updated_at
    )
    VALUES (
      v_user,
      v_title,
      'High quality ' || LOWER(v_category_title) || ' in ' || v_condition || ' condition. Perfect for swapping!',
      v_category.id,
      v_condition,
      round((50 + random() * 950)::numeric, 2), -- Price range: 50-1000
      v_currency,
      'available',
      v_city.center_lat + (random() - 0.5) * 0.1,
      v_city.center_lng + (random() - 0.5) * 0.1,
      jsonb_build_array(
        jsonb_build_object('url', v_image_url, 'order', 0)
      ),
      now() - (random() * 30 || ' days')::interval,
      now() - (random() * 30 || ' days')::interval
    );

    v_count := v_count + 1;
    
    -- Progress indicator every 100 items
    IF v_count % 100 = 0 THEN
      RAISE NOTICE 'Generated % items...', v_count;
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully generated % items with realistic titles and images', v_count;
  
  -- Update geo column for all new items
  UPDATE public.items
  SET geo = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography
  WHERE geo IS NULL AND location_lat IS NOT NULL AND location_lng IS NOT NULL;
  
  RAISE NOTICE 'Updated geo coordinates for all items';
END;
$$;
