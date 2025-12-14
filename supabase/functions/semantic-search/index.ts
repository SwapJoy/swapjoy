import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const requestBody = await req.json();
    const { 
      query, 
      limit = 30,
      minPrice = 0,
      maxPrice = null,
      categories = [],
      distance = null,
      coordinates = null
    } = requestBody;
    
    console.log('[semantic-search] Received request:', {
      query: query || '(null)',
      limit,
      minPrice,
      maxPrice,
      categories,
      categoriesCount: Array.isArray(categories) ? categories.length : 'not-array',
      categoriesType: Array.isArray(categories) ? 'array' : typeof categories,
      distance,
      coordinates,
    });
    
    const q = (query || '').trim();
    const hasQuery = q.length > 0;
    
    let embedding: number[] | null = null;
    
    // Generate query embedding only if query is provided
    if (hasQuery) {
      const openaiResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: q, model: 'text-embedding-ada-002' }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        return new Response(JSON.stringify({ error: errorData.message || 'OpenAI error' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
      }

      const embJson = await openaiResponse.json();
      embedding = embJson?.data?.[0]?.embedding;
      if (!embedding || !Array.isArray(embedding)) {
        return new Response(JSON.stringify({ error: 'Invalid embedding' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
      }
    }

    // Extract coordinates
    const userLat = coordinates?.lat || null;
    const userLng = coordinates?.lng || null;

    // Prepare category_ids - ensure it's a proper UUID array
    const categoryIds = Array.isArray(categories) && categories.length > 0 
      ? categories.filter((cat: any) => cat && typeof cat === 'string' && cat.length > 0)
      : [];

    console.log('[semantic-search] Calling match_items with params:', {
      hasQuery,
      hasEmbedding: embedding !== null,
      match_threshold: 0.5,
      match_count: limit,
      min_price: minPrice || 0,
      max_price: maxPrice || null,
      category_ids: categoryIds,
      category_ids_count: categoryIds.length,
      category_ids_sample: categoryIds.slice(0, 3),
      distance_km: distance || null,
      user_lat: userLat,
      user_lng: userLng,
    });

    // Query Postgres for nearest neighbors or filtered items
    // Higher threshold for more strict/relevant results when using semantic search
    const { data, error } = await supabaseClient
      .rpc('match_items', {
        query_embedding: embedding,  // null if no query
        match_threshold: 0.5,  // Stricter threshold for more relevant semantic matches
        match_count: limit,
        min_price: minPrice || 0,
        exclude_user_id: null,
        max_price: maxPrice || null,
        category_ids: categoryIds,
        distance_km: distance || null,
        user_lat: userLat,
        user_lng: userLng,
      });

    if (error) {
      console.error('[semantic-search] match_items RPC error:', error);
      console.error('[semantic-search] Error details:', JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ error: error.message }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }

    const itemsCount = Array.isArray(data) ? data.length : 0;
    console.log('[semantic-search] match_items returned', itemsCount, 'items');
    
    if (itemsCount > 0 && categoryIds.length > 0) {
      // Log category distribution in results
      const categoryCounts: Record<string, number> = {};
      data.forEach((item: any) => {
        const catId = item.category_id || 'null';
        categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
      });
      console.log('[semantic-search] Result category distribution:', categoryCounts);
      console.log('[semantic-search] Expected categories:', categoryIds);
      const matchingCategories = data.filter((item: any) => 
        item.category_id && categoryIds.includes(item.category_id)
      ).length;
      console.log('[semantic-search] Items matching category filter:', matchingCategories, 'out of', itemsCount);
    }

    // Enrich with primary image in a single query (if not included)
    let items = Array.isArray(data) ? data : [];
    
    // If no semantic results or very few, enhance with fuzzy text search
    // Only apply fuzzy fallback if we have a query and very few results
    // Skip fuzzy fallback for filter-only searches (no query)
    if (hasQuery && items.length < 3) {
      console.log(`[semantic-search] Only ${items.length} semantic results, enhancing with text search`);
      const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2); // Get words longer than 2 chars
      
      if (words.length > 0) {
        // Build a query that matches items containing most of the search words
        // This helps with typos - e.g., "esp ltd khz" will match "esp ltd khwz" because both have "esp" and "ltd"
        const existingIds = new Set(items.map((it: any) => it.id));
        const wordConditions = words.map(word => `title.ilike.%${word}%`).join(',');
        
        // Build text search query with filters applied
        let textQuery = supabaseClient
          .from('items')
          .select('id, title, description, price, currency, condition, category_id, user_id')
          .eq('status', 'available')
          .not('embedding', 'is', null)
          .or(wordConditions)
          .gte('price', minPrice || 0);
        
        // Apply max price filter
        if (maxPrice !== null && maxPrice !== undefined) {
          textQuery = textQuery.lte('price', maxPrice);
        }
        
        // Apply category filter if categories are provided
        if (categoryIds.length > 0) {
          textQuery = textQuery.in('category_id', categoryIds);
          console.log('[semantic-search] Text search applying category filter:', categoryIds);
        }
        
        // Apply distance filter if provided
        if (distance !== null && userLat !== null && userLng !== null) {
          // Note: Distance filtering in text search would require a more complex query
          // For now, we'll rely on the semantic search for distance filtering
          // and only use text search as a fallback when semantic results are sparse
        }
        
        const { data: textResults } = await textQuery.limit(limit * 2); // Get more candidates
        
        if (textResults && textResults.length > 0) {
          // Get images separately to avoid ambiguous column reference
          const textResultIds = textResults.map((r: any) => r.id).filter(Boolean);
          const { data: imageData } = await supabaseClient
            .from('item_images')
            .select('item_id, image_url')
            .in('item_id', textResultIds)
            .order('created_at', { ascending: true });
          
          // Group images by item_id
          const imagesByItemId = new Map<string, string>();
          if (imageData) {
            imageData.forEach((img: any) => {
              if (!imagesByItemId.has(img.item_id)) {
                imagesByItemId.set(img.item_id, img.image_url);
              }
            });
          }
          
          // Filter out already found items and calculate word match score
          const newItems = textResults
            .filter((item: any) => !existingIds.has(item.id))
            .map((item: any) => {
              const titleLower = (item.title || '').toLowerCase();
              const descLower = (item.description || '').toLowerCase();
              const text = `${titleLower} ${descLower}`;
              
              // Count how many search words appear in the item
              const matchCount = words.filter(word => text.includes(word)).length;
              const matchRatio = matchCount / words.length;
              
              return {
                ...item,
                image_url: imagesByItemId.get(item.id) || null,
                similarity: 0.3 + (matchRatio * 0.2), // Base similarity of 0.3-0.5 for text matches
                status: item.status || 'available',
                location_lat: item.location_lat || null,
                location_lng: item.location_lng || null,
                created_at: item.created_at || null,
                updated_at: item.updated_at || null,
              };
            })
            .sort((a: any, b: any) => b.similarity - a.similarity)
            .slice(0, limit - items.length); // Only take as many as we need
          
          items = [...items, ...newItems];
        }
      }
    }
    
    // Enrich items with user, category, and images data to match fetchSection structure
    const itemIds = items.map((it: any) => it.id).filter(Boolean);
    if (itemIds.length === 0) {
      const searchType = hasQuery ? `query: "${q}"` : 'filter-only search';
      console.log(`[semantic-search] Returning ${items.length} items for ${searchType}`);
      return new Response(JSON.stringify({ items: [] }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
    }

    // Get unique user_ids and category_ids from results
    const userIds = [...new Set(items.map((it: any) => it.user_id).filter(Boolean))];
    const resultCategoryIds = [...new Set(items.map((it: any) => it.category_id).filter(Boolean))];

    // Fetch user data
    let usersMap = new Map();
    if (userIds.length > 0) {
      const { data: usersData } = await supabaseClient
        .from('users')
        .select('id, username, first_name, last_name, profile_image_url')
        .in('id', userIds);
      
      if (usersData) {
        usersData.forEach((user: any) => {
          usersMap.set(user.id, user);
        });
      }
    }

    // Fetch category data
    let categoriesMap = new Map();
    if (resultCategoryIds.length > 0) {
      const { data: categoriesData } = await supabaseClient
        .from('categories')
        .select('id, title_en, title_ka')
        .in('id', resultCategoryIds);
      
      if (categoriesData) {
        categoriesData.forEach((cat: any) => {
          categoriesMap.set(cat.id, cat);
        });
      }
    }

    // Fetch images for all items
    const { data: imageData } = await supabaseClient
      .from('item_images')
      .select('id, item_id, image_url, is_primary, created_at')
      .in('item_id', itemIds)
      .order('created_at', { ascending: true });

    // Group images by item_id
    const imagesByItemId = new Map();
    if (imageData) {
      imageData.forEach((img: any) => {
        if (!imagesByItemId.has(img.item_id)) {
          imagesByItemId.set(img.item_id, []);
        }
        imagesByItemId.get(img.item_id).push({
          id: img.id,
          image_url: img.image_url,
          is_primary: img.is_primary || false,
          created_at: img.created_at
        });
      });
    }

    // Transform items to match fetchSection structure (same as database functions)
    // The structure should match fn_top_picks_for_you and other database functions:
    // - images: JSONB array with { id, url, is_primary, created_at }
    // - User fields: directly on item (username, first_name, last_name, profile_image_url)
    const transformedItems = items.map((item: any) => {
      const user = usersMap.get(item.user_id) || null;
      const categoryData = item.category_id ? categoriesMap.get(item.category_id) : null;
      const images = imagesByItemId.get(item.id) || [];
      
      // Transform images to match database function format (url property, not image_url)
      const imagesArray = images.map((img: any) => ({
        id: img.id,
        url: img.image_url,  // Note: database functions use 'url', not 'image_url'
        is_primary: img.is_primary || false,
        created_at: img.created_at
      }));

      // Get primary image URL for easy access
      const primaryImage = imagesArray.find((img: any) => img.is_primary) || imagesArray[0] || null;
      const imageUrl = primaryImage?.url || null;

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency || 'USD',
        condition: item.condition,
        status: item.status || 'available',
        location_lat: item.location_lat,
        location_lng: item.location_lng,
        created_at: item.created_at,
        updated_at: item.updated_at,
        category_id: item.category_id,
        // Category fields (for display)
        category_name: categoryData?.title_en || categoryData?.title_ka || null,
        category_name_en: categoryData?.title_en || null,
        category_name_ka: categoryData?.title_ka || null,
        // Category object (for compatibility)
        category: categoryData ? {
          id: categoryData.id,
          title_en: categoryData.title_en,
          title_ka: categoryData.title_ka,
          name: categoryData.title_en || categoryData.title_ka
        } : null,
        // User fields should be directly on the item (matching database function format)
        user_id: item.user_id,
        username: user?.username || null,
        first_name: user?.first_name || null,
        last_name: user?.last_name || null,
        profile_image_url: user?.profile_image_url || null,
        // Also include nested user object for backward compatibility
        user: user ? {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_image_url: user.profile_image_url
        } : null,
        // Images array (matching database function format)
        images: imagesArray,
        // Primary image URL for easy access
        image_url: imageUrl,
        distance_km: item.distance_km || null,
        similarity: item.similarity || null
      };
    });

    const searchType = hasQuery ? `query: "${q}"` : 'filter-only search';
    console.log(`[semantic-search] Returning ${transformedItems.length} items for ${searchType}`);
    return new Response(JSON.stringify({ items: transformedItems }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as any).message || 'Unknown error' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
});


