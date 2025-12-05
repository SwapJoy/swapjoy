import { ApiService } from './api';

export interface ImageAnalysisResult {
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

export interface ImageAnalysisResponse {
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

export class ImageAnalysisService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // ms

  /**
   * Analyze images using OpenAI Vision API via Edge Function
   * @param imageUrls Array of Supabase Storage URLs
   * @param itemId Optional item ID for storing results in item_images.meta
   * @param imageIds Optional array of image IDs for mapping results
   */
  static async analyzeImages(
    imageUrls: string[],
    itemId?: string,
    imageIds?: string[]
  ): Promise<ImageAnalysisResponse> {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('At least one image URL is required');
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.MAX_RETRIES) {
      try {
        const client = await ApiService.getAuthenticatedClient();

        const { data, error } = await client.functions.invoke('analyze-images', {
          body: {
            imageUrls,
            itemId,
            imageIds,
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to analyze images');
        }

        if (!data) {
          throw new Error('No data returned from analysis function');
        }

        return data as ImageAnalysisResponse;
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

