import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { query, limit = 30 } = await req.json();
    const q = (query || '').trim();
    if (!q) return new Response(JSON.stringify({ items: [] }), { headers: { 'Content-Type': 'application/json' }, status: 200 });

    // Generate query embedding using OpenAI
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
    const embedding = embJson?.data?.[0]?.embedding;
    if (!embedding || !Array.isArray(embedding)) {
      return new Response(JSON.stringify({ error: 'Invalid embedding' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }

    // Query Postgres for nearest neighbors
    // Higher threshold for more strict/relevant results
    const { data, error } = await supabaseClient
      .rpc('match_items', {
        query_embedding: embedding,
        match_threshold: 0.5,  // Stricter threshold for more relevant semantic matches
        match_count: limit,
        exclude_user_id: null,
      });

    if (error) {
      console.error('[semantic-search] match_items RPC error:', error);
      return new Response(JSON.stringify({ error: error.message }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }

    // Enrich with primary image in a single query (if not included)
    let items = Array.isArray(data) ? data : [];
    
    // If no semantic results or very few, enhance with fuzzy text search
    // Split query into words and search for items that match most words
    // Only trigger fuzzy fallback if we have very few results (more strict)
    if (items.length < 3) {
      console.log(`[semantic-search] Only ${items.length} semantic results, enhancing with text search`);
      const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2); // Get words longer than 2 chars
      
      if (words.length > 0) {
        // Build a query that matches items containing most of the search words
        // This helps with typos - e.g., "esp ltd khz" will match "esp ltd khwz" because both have "esp" and "ltd"
        const existingIds = new Set(items.map((it: any) => it.id));
        const wordConditions = words.map(word => `title.ilike.%${word}%`).join(',');
        
        const { data: textResults } = await supabaseClient
          .from('items')
          .select('id, title, description, price, currency, condition, category_id, user_id')
          .eq('status', 'available')
          .not('embedding', 'is', null)
          .or(wordConditions)
          .limit(limit * 2); // Get more candidates
        
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
                similarity: 0.3 + (matchRatio * 0.2) // Base similarity of 0.3-0.5 for text matches
              };
            })
            .sort((a: any, b: any) => b.similarity - a.similarity)
            .slice(0, limit - items.length); // Only take as many as we need
          
          items = [...items, ...newItems];
        }
      }
    }
    
    // Enrich items with images if needed
    const itemIds = items.map((it: any) => it.id).filter(Boolean);
    if (itemIds.length > 0) {
      const { data: imageData } = await supabaseClient
        .from('item_images')
        .select('item_id, image_url')
        .in('item_id', itemIds)
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
      
      // Add image_url to items
      items = items.map((item: any) => ({
        ...item,
        image_url: imagesByItemId.get(item.id) || null,
      }));
    }

    console.log(`[semantic-search] Returning ${items.length} items for query: "${q}"`);
    return new Response(JSON.stringify({ items }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as any).message || 'Unknown error' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
});


