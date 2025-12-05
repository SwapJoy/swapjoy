import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ImageAnalysisResult {
  imageUrl: string;
  imageId?: string;
  detectedObjects: string[];
  suggestedCategory: {
    id: string;
    name: string;
    confidence: number;
  } | null;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCondition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null;
  confidence: number;
}

interface ImageAnalysisResponse {
  results: ImageAnalysisResult[];
  aggregated: {
    detectedObjects: string[];
    suggestedCategory: {
      id: string;
      name: string;
      confidence: number;
    } | null;
    suggestedTitle: string;
    suggestedDescription: string;
    suggestedCondition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null;
  };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { imageUrls, itemId, imageIds } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'imageUrls array is required' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

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
                    text: `Analyze this image and provide item details in JSON format.

Return JSON:
{
  "detectedObjects": ["object1", "object2"],
  "suggestedTitle": "Item Title (3-8 words)",
  "suggestedDescription": "Description (2-3 sentences) including condition, color, material, brand, size, features, defects",
  "suggestedCondition": "new|like_new|good|fair|poor",
  "confidence": 0.85
}

Be specific about condition and details.`
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
            max_tokens: 300, // Reduced from 500 for faster response
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

        // No category matching - category will be selected by user

        // Validate and normalize condition
        let suggestedCondition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null = null;
        if (analysisData.suggestedCondition) {
          const condition = analysisData.suggestedCondition.toLowerCase().trim();
          if (['new', 'like_new', 'good', 'fair', 'poor'].includes(condition)) {
            suggestedCondition = condition as 'new' | 'like_new' | 'good' | 'fair' | 'poor';
          } else if (condition.includes('like new') || condition.includes('like-new')) {
            suggestedCondition = 'like_new';
          } else if (condition.includes('good')) {
            suggestedCondition = 'good';
          } else if (condition.includes('fair')) {
            suggestedCondition = 'fair';
          } else if (condition.includes('poor') || condition.includes('bad')) {
            suggestedCondition = 'poor';
          }
        }

        return {
          imageUrl,
          imageId,
          detectedObjects: Array.isArray(analysisData.detectedObjects)
            ? analysisData.detectedObjects
            : [],
          suggestedCategory: null, // Category removed - user will select
          suggestedTitle: analysisData.suggestedTitle || '',
          suggestedDescription: analysisData.suggestedDescription || '',
          suggestedCondition,
          confidence: analysisData.confidence || 0.5,
        };
      } catch (error) {
        console.error(`Error analyzing image ${imageUrl}:`, error);
        return null;
      }
    });

    // Wait for all images to be analyzed in parallel
    const results = await Promise.all(analysisPromises);
    const analysisResults = results.filter((r): r is ImageAnalysisResult => r !== null);

    if (analysisResults.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Failed to analyze any images',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Aggregate results
    const allDetectedObjects = new Set<string>();
    analysisResults.forEach((result) => {
      result.detectedObjects.forEach((obj) => allDetectedObjects.add(obj));
    });

    // Aggregate title, description, and condition (use the one with highest confidence)
    const bestResult = analysisResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // Aggregate condition (use most common, or best result if no consensus)
    const conditionCounts = new Map<string, number>();
    analysisResults.forEach((result) => {
      if (result.suggestedCondition) {
        conditionCounts.set(
          result.suggestedCondition,
          (conditionCounts.get(result.suggestedCondition) || 0) + 1
        );
      }
    });
    let aggregatedCondition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null = null;
    if (conditionCounts.size > 0) {
      const sortedConditions = Array.from(conditionCounts.entries()).sort((a, b) => b[1] - a[1]);
      aggregatedCondition = sortedConditions[0][0] as 'new' | 'like_new' | 'good' | 'fair' | 'poor';
    } else if (bestResult.suggestedCondition) {
      aggregatedCondition = bestResult.suggestedCondition;
    }

    const aggregated: ImageAnalysisResponse['aggregated'] = {
      detectedObjects: Array.from(allDetectedObjects),
      suggestedCategory: null, // Category removed - user will select
      suggestedTitle: bestResult.suggestedTitle,
      suggestedDescription: bestResult.suggestedDescription,
      suggestedCondition: aggregatedCondition,
    };

    // Debug logging
    console.log('[analyze-images] Aggregated result:', JSON.stringify({
      detectedObjects: aggregated.detectedObjects,
      suggestedTitle: aggregated.suggestedTitle,
      suggestedDescription: aggregated.suggestedDescription,
      suggestedCondition: aggregated.suggestedCondition,
    }));
    console.log('[analyze-images] Analysis results count:', analysisResults.length);

    // If itemId and imageIds are provided, store results in item_images.meta
    if (itemId && imageIds && imageIds.length === analysisResults.length) {
      for (let i = 0; i < analysisResults.length; i++) {
        const result = analysisResults[i];
        const imageId = imageIds[i];

        if (imageId) {
          const { error: updateError } = await supabaseClient
            .from('item_images')
            .update({
              meta: {
                detectedObjects: result.detectedObjects,
                suggestedCategory: result.suggestedCategory,
                suggestedTitle: result.suggestedTitle,
                suggestedDescription: result.suggestedDescription,
                suggestedCondition: result.suggestedCondition,
                confidence: result.confidence,
                analyzedAt: new Date().toISOString(),
              },
            })
            .eq('id', imageId)
            .eq('item_id', itemId);

          if (updateError) {
            console.error(`Error updating item_images.meta for ${imageId}:`, updateError);
          }
        }
      }
    }

    const response: ImageAnalysisResponse = {
      results: analysisResults,
      aggregated,
    };

    return new Response(JSON.stringify(response), {
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

