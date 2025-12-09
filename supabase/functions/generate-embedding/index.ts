import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // SECURITY: Check for internal secret header (only triggers have this)
  const internalSecret = req.headers.get('x-internal-secret');
  const expectedSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
  
  if (!internalSecret || internalSecret !== expectedSecret) {
    console.error('Unauthorized: Invalid or missing internal secret');
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Internal use only' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Accept both old format (itemId only) and new format (with title, description, category titles)
    const { itemId, title, description, category_title_en, category_title_ka } = await req.json();

    if (!itemId) {
      return new Response(
        JSON.stringify({ error: 'itemId is required' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // If title/description/category titles are provided, use them directly (from trigger)
    // Otherwise, fetch from database (backward compatibility)
    let itemTitle = title;
    let itemDescription = description;
    let categoryNameEn = category_title_en || '';
    let categoryNameKa = category_title_ka || '';

    if (!itemTitle || !itemDescription) {
      // Fallback: fetch item details if not provided
      const { data: item, error: itemError } = await supabaseClient
        .from('items')
        .select('title, description, category_id')
        .eq('id', itemId)
        .single();

      if (itemError || !item) {
        console.error('Error fetching item:', itemError?.message || 'Item not found');
        return new Response(
          JSON.stringify({ error: itemError?.message || 'Item not found' }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      itemTitle = itemTitle || item.title;
      itemDescription = itemDescription || item.description;

      // Fetch category if not provided and category_id exists
      if ((!categoryNameEn && !categoryNameKa) && item.category_id) {
        const { data: category, error: categoryError } = await supabaseClient
          .from('categories')
          .select('title_en, title_ka, name')
          .eq('id', item.category_id)
          .single();

        if (!categoryError && category) {
          categoryNameEn = category.title_en || category.name || '';
          categoryNameKa = category.title_ka || '';
        }
      }
    }

    // Get item images with meta data
    const { data: itemImages, error: imagesError } = await supabaseClient
      .from('item_images')
      .select('meta')
      .eq('item_id', itemId)
      .order('sort_order', { ascending: true });

    if (imagesError) {
      console.warn('Warning: Failed to fetch item images:', imagesError);
    }

    // Extract image analysis information from meta
    const imageInfo: string[] = [];
    const detectedObjectsSet = new Set<string>();

    if (itemImages && itemImages.length > 0) {
      itemImages.forEach((img) => {
        if (img.meta) {
          // Add detected objects
          if (Array.isArray(img.meta.detectedObjects)) {
            img.meta.detectedObjects.forEach((obj: string) => detectedObjectsSet.add(obj));
          }

          // Add description if available
          if (img.meta.suggestedDescription) {
            imageInfo.push(img.meta.suggestedDescription);
          }
        }
      });
    }

    // Build image context string
    const detectedObjects = Array.from(detectedObjectsSet);
    const imageContext = detectedObjects.length > 0
      ? `Detected objects: ${detectedObjects.join(', ')}.`
      : '';
    const imageDescriptions = imageInfo.length > 0
      ? `Image descriptions: ${imageInfo.join(' ')}.`
      : '';

    // Create text for embedding with image information
    // Include title, description, and category titles in both languages for better semantic matching
    let text = `${itemTitle || ''}. ${itemDescription || ''}`;
    
    // Add category information in both languages for better semantic search
    if (categoryNameEn) {
      text += ` Category (English): ${categoryNameEn}.`;
    }
    if (categoryNameKa && categoryNameKa !== categoryNameEn) {
      text += ` Category (Georgian): ${categoryNameKa}.`;
    }
    
    if (imageContext || imageDescriptions) {
      text += ` Images: ${imageContext} ${imageDescriptions}`.trim();
    }

    // Generate embedding using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.message || openaiResponse.statusText}` }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: openaiResponse.status,
        }
      );
    }

    const { data } = await openaiResponse.json();
    const embedding = data[0].embedding;

    // Store embedding in database
    const { error: updateError } = await supabaseClient
      .from('items')
      .update({ embedding })
      .eq('id', itemId);

    if (updateError) {
      console.error('Error updating item with embedding:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log(`Successfully generated embedding for item ${itemId}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        itemId,
        embeddingLength: embedding.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

