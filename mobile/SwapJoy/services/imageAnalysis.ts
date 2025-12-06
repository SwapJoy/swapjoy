import { ApiService } from './api';

export interface ImageAnalysisResponse {
    imageUrl: string;
    imageId: string;
    title: string;
    categoryId: string | null;
    description: string;
    error: string | null;
}

export class ImageAnalysisService {
  private static readonly MAX_RETRIES = 1;
  private static readonly RETRY_DELAY = 500; // ms

  /**
   * Analyze images using OpenAI Vision API via Edge Function
   * @param imageUrls Array of Supabase Storage URLs
   * @param language Language code ('en' or 'ka')
   * @param itemId Optional item ID for storing results in item_images.meta
   */
  static async analyzeImages(
    imageUrls: string[]    
  ): Promise<ImageAnalysisResponse> {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('At least one image URL is required');
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.MAX_RETRIES) {
      try {
        const result = await ApiService.authenticatedCall(async (client) => {
          const { data, error } = await client.functions.invoke('analyze-images', {
            body: {
              imageUrls,
            },
          });

          if (error) {
            return { data: null, error };
          }

          return { data, error: null };
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to analyze images');
        }

        if (!result.data) {
          throw new Error('No data returned from analysis function');
        }

        // Edge function returns an array of results, aggregate into single object
        const results: ImageAnalysisResponse[] = Array.isArray(result.data) ? result.data : [result.data];
        
        // Filter out null/undefined results (failed analyses)
        const validResults = results.filter((r): r is ImageAnalysisResponse => 
          r !== null && r !== undefined && typeof r === 'object' && 'imageUrl' in r && !!r.imageUrl
        );

        if (validResults.length === 0) {
          throw new Error('No valid analysis results returned');
        }

        // Aggregate results: use first valid result, prefer non-null values
        const firstResult = validResults[0];
        
        // Find best title (first non-empty)
        const bestTitle = validResults.find(r => r.title && r.title.trim())?.title || firstResult.title || '';
        
        // Find best description (first non-empty)
        const bestDescription = validResults.find(r => r.description && r.description.trim())?.description || firstResult.description || '';
        
        // Find best categoryId (first non-null)
        const bestCategoryId = validResults.find(r => r.categoryId)?.categoryId || firstResult.categoryId || null;
        
        // Check for errors
        const errorMessage = validResults.find(r => r.error)?.error || null;

        // Use first image's URL and ID for the aggregated response
        return {
          imageUrl: firstResult.imageUrl,
          imageId: firstResult.imageId || '',
          title: bestTitle,
          categoryId: bestCategoryId,
          description: bestDescription,
          error: errorMessage,
        };
      } catch (error: any) {
        lastError = error;
        attempt++;

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff
          const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
          await this.delay(delay);
          console.log(`Retrying image analysis (attempt ${attempt + 1}/${this.MAX_RETRIES})...`);
        }
      }
    }

    throw lastError || new Error('Failed to analyze images after retries');
  }

  /**
   * Delay helper for retry logic
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

