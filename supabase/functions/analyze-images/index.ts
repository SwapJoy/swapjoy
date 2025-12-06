import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { imageUrls, imageIds } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'imageUrls array is required' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Fetch categories from database
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('categories')
      .select('id, title_en')
      .eq('is_active', true)

    if (categoriesError) {
      console.error('[analyze-images] Error fetching categories:', JSON.stringify(categoriesError));
      console.error('[analyze-images] Error details:', {
        message: categoriesError.message,
        details: categoriesError.details,
        hint: categoriesError.hint,
        code: categoriesError.code,
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch categories from database',
          details: categoriesError.message 
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!categories || categories.length === 0) {
      console.warn('[analyze-images] Warning: No active categories found in database.');
      return new Response(
        JSON.stringify({ error: 'No categories available' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log(`[analyze-images] Loaded ${categories.length} categories from database`);

    // Analyze images in parallel for better performance
    const analysisPromises = imageUrls.map(async (imageUrl: string, i: number) => {
      const imageId = imageIds?.[i];

      try {
        
        // Call OpenAI Vision API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `You are a product listing extractor. Extract ONLY inherent product information — ignore actions or context from the photo (e.g., ignore charging, being held, background, lighting, reflections).  AVAILABLE CATEGORIES (you MUST select the best matching one):
${categories.map((cat: any, idx: number) => {
  return `${idx + 1}. ${cat.title_en} (ID: ${cat.id})`;
}).join('\n')}

Return ONLY this exact JSON:
{
  "title": "",
  "categoryId": "EXACT-UUID-FROM-LIST-ABOVE",
  "description": "",
  "error": NULL
}

Rules:
- title: short (<= 5 words), combine brand + product type if visible. if not found empty
- categoryId: MUST be the exact UUID from the categories list above. Select the best matching category, if not found null
- description: <= 10 words, describe the object. if not found empty.
- error: If there's a human, animal, nude, violence, etc. in the image, return "Invalid image".
- NEVER mention actions, charging, cables, background objects, scenery, or any inferred usage situation.
- ALWAYS return valid JSON, no explanations, no markdown.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageUrl,
                    },
                  },
                ],
              },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 200, // Reduced from 500 for faster response
          }),
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          console.error('OpenAI API error:', errorData);
          return null; // Return null for failed analysis
        }

        const openaiData = await openaiResponse.json();
        const content = openaiData.choices?.[0]?.message?.content;

        if (!content) {
          console.warn('No content in OpenAI response for image:', imageUrl);
          return null;
        }

        let analysisData: any;
        try {
          analysisData = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          return null;
        }

        // Debug: Log what OpenAI returned
        console.log('[analyze-images] OpenAI response:', JSON.stringify(analysisData));

        return {
          imageUrl,
          imageId,
          ...analysisData
        };
      } catch (error) {
        console.error(`Error analyzing image ${imageUrl}:`, error);
        return null;
      }
    });

    // Wait for all images to be analyzed in parallel
    const results = await Promise.all(analysisPromises);

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

