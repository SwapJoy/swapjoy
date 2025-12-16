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
      coordinates = null,
      currency = 'USD'  // Default to USD if not provided
    } = requestBody;
    
    console.log('[semantic-search] Received request:', {
      query: query || '(null)',
      limit,
      minPrice,
      maxPrice,
      currency,
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
        console.error('[semantic-search] Failed to generate embedding for query:', q);
        return new Response(JSON.stringify({ error: 'Invalid embedding' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
      }
      console.log('[semantic-search] Generated embedding:', {
        query: q,
        embeddingLength: embedding.length,
        embeddingSample: embedding.slice(0, 5), // First 5 values for debugging
      });
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
      match_threshold: 0.7,
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
    // 0.7 threshold means items must have at least 70% similarity to be included
    // Use RPC call with parameters in the exact order as defined in the function signature
    const rpcParams = {
      query_embedding: embedding,
      match_threshold: 0.80,  // Increased to 0.80 (80% similarity) for much stricter matching - random text should return no results
      match_count: limit,
      min_price: minPrice || 0,
      exclude_user_id: null,
      max_price: maxPrice || null,
      category_ids: categoryIds.length > 0 ? categoryIds : [],
      distance_km: distance || null,
      user_lat: userLat || null,
      user_lng: userLng || null,
    };
    
    console.log('[semantic-search] Calling match_items RPC with params:', {
      ...rpcParams,
      query_embedding: rpcParams.query_embedding ? `[${rpcParams.query_embedding.length} dims]` : null,
      category_ids_count: Array.isArray(rpcParams.category_ids) ? rpcParams.category_ids.length : 0,
    });
    
    const { data, error } = await supabaseClient.rpc('match_items', rpcParams);

    if (error) {
      console.error('[semantic-search] match_items RPC error:', error);
      console.error('[semantic-search] Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's a schema cache error - this usually means the function doesn't exist or migration hasn't been applied
      if (error.message?.includes('schema cache') || error.message?.includes('Could not find the function')) {
        console.error('[semantic-search] Schema cache error detected. This usually means:');
        console.error('  1. The migration 20250129000000_update_match_items_with_filters.sql has not been applied to the database');
        console.error('  2. Or the function signature in the database doesn\'t match the migration file');
        console.error('  Please verify the migration has been applied: SELECT proname, pg_get_function_arguments(oid) FROM pg_proc WHERE proname = \'match_items\';');
        
        return new Response(
          JSON.stringify({ 
            error: 'Database function not found. Please ensure the match_items function migration has been applied to your database.',
            details: error.message,
            suggestion: 'Run the migration: 20250129000000_update_match_items_with_filters.sql'
          }), 
          { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      return new Response(JSON.stringify({ error: error.message, details: error }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }

    const itemsCount = Array.isArray(data) ? data.length : 0;
    console.log('[semantic-search] match_items returned', itemsCount, 'items');
    
    // Log similarity scores for debugging and validate threshold enforcement
    if (itemsCount > 0 && hasQuery) {
      const similarityScores = data.map((item: any) => ({
        title: item.title,
        similarity: item.similarity,
      })).sort((a: any, b: any) => b.similarity - a.similarity);
      console.log('[semantic-search] Query:', q);
      console.log('[semantic-search] Top similarity scores:', similarityScores.slice(0, 10));
      console.log('[semantic-search] All similarity scores range:', {
        min: Math.min(...similarityScores.map((s: any) => s.similarity)),
        max: Math.max(...similarityScores.map((s: any) => s.similarity)),
        avg: similarityScores.reduce((sum: number, s: any) => sum + s.similarity, 0) / similarityScores.length
      });
      
      // Validate that all items meet the threshold
      const threshold = 0.80;
      const belowThreshold = data.filter((item: any) => {
        const sim = item.similarity;
        return sim === null || sim === undefined || sim < threshold;
      });
      if (belowThreshold.length > 0) {
        console.warn('[semantic-search] WARNING: Found', belowThreshold.length, 'items below similarity threshold', threshold);
        console.warn('[semantic-search] Items below threshold:', belowThreshold.map((item: any) => ({
          title: item.title,
          similarity: item.similarity
        })));
      }
      
      // If query looks like random gibberish and we still have results, log a warning
      if (q.length > 10 && /^[a-z]{10,}$/i.test(q) && similarityScores.length > 0) {
        const maxSim = similarityScores[0]?.similarity || 0;
        if (maxSim < 0.85) {
          console.warn('[semantic-search] WARNING: Random-looking query returned results. Max similarity:', maxSim, 'Query:', q);
        }
      }
    }
    
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

    // Database function already returns all enriched data via JOINs
    // No need for separate queries - data structure matches fn_top_picks_for_you
    let items = Array.isArray(data) ? data : [];
    
    // Additional safety check: filter out items that don't meet similarity threshold when query is provided
    if (hasQuery && embedding !== null) {
      const threshold = 0.80;
      const beforeFilter = items.length;
      items = items.filter((item: any) => {
        const sim = item.similarity;
        // Only include items with similarity >= threshold (null/undefined similarity should be excluded)
        return sim !== null && sim !== undefined && sim >= threshold;
      });
      if (items.length < beforeFilter) {
        console.warn(`[semantic-search] Filtered out ${beforeFilter - items.length} items that didn't meet similarity threshold ${threshold}`);
      }
    }
    
    if (items.length === 0) {
      const searchType = hasQuery ? `query: "${q}"` : 'filter-only search';
      console.log(`[semantic-search] Returning ${items.length} items for ${searchType}`);
      return new Response(JSON.stringify({ items: [] }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
    }

    // Transform items to match explore screen structure (same as fn_top_picks_for_you)
    // Database function now provides: user fields, category names, images array
    const transformedItems = items.map((item: any) => {
      // Get primary image URL for easy access (images array is already in correct format from DB)
      // Handle both JSONB array and regular array
      let images = [];
      if (Array.isArray(item.images)) {
        images = item.images;
      } else if (item.images && typeof item.images === 'object') {
        // Try to parse if it's a JSONB object
        try {
          images = JSON.parse(item.images) || [];
        } catch {
          images = [];
        }
      }
      const primaryImage = images.find((img: any) => img.is_primary) || images[0] || null;
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
        // Category fields (from database JOIN)
        category_name: item.category_name_en || item.category_name_ka || null,
        category_name_en: item.category_name_en || null,
        category_name_ka: item.category_name_ka || null,
        // Category object (for compatibility)
        category: item.category_id ? {
          id: item.category_id,
          title_en: item.category_name_en,
          title_ka: item.category_name_ka,
          name: item.category_name_en || item.category_name_ka
        } : null,
        // User fields (from database JOIN - matching fn_top_picks_for_you structure)
        user_id: item.user_id,
        username: item.username || null,
        first_name: item.first_name || null,
        last_name: item.last_name || null,
        profile_image_url: item.profile_image_url || null,
        // Also include nested user object for backward compatibility
        user: item.user_id ? {
          id: item.user_id,
          username: item.username || item.username || null,
          first_name: item.first_name || null,
          last_name: item.last_name || null,
          profile_image_url: item.profile_image_url || null
        } : null,
        // Images array (already in correct format from database: { id, url, is_primary, created_at })
        images: images,
        // Primary image URL for easy access
        image_url: imageUrl,
        distance_km: item.calculated_distance_km || item.distance_km || null,
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


