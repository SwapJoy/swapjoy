import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { imageUrls, imageIds, categories } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'imageUrls array is required' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate categories from client
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.warn('[analyze-images] Warning: No categories provided by client.');
      return new Response(
        JSON.stringify({ error: 'Categories array is required' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Filter to only active categories and ensure they have required fields
    const activeCategories = categories.filter((cat: any) => 
      cat && cat.id && cat.title_en && cat.is_active !== false
    );

    if (activeCategories.length === 0) {
      console.warn('[analyze-images] Warning: No active categories found in provided categories.');
      return new Response(
        JSON.stringify({ error: 'No active categories available' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`[analyze-images] Using ${activeCategories.length} categories from client`);

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
            temperature: 0,
            max_tokens: 120,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `You are a product listing extractor. Extract ONLY inherent product information — ignore actions or context from the photo (e.g., ignore charging, being held, background, lighting, reflections).  AVAILABLE CATEGORIES (you MUST select the best matching one):
${activeCategories.map((cat: any, idx: number) => {
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

