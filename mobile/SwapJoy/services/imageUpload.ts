import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { AuthService } from './auth';

export interface UploadProgress {
  imageId: string;
  progress: number;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'images';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // ms

  /**
   * Upload a single image to Supabase Storage
   */
  static async uploadImage(
    imageUri: string,
    imageId: string,
    draftId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; error?: string }> {
    try {
      // Get authenticated user
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      const userId = user.id;

      // Read file as base64
      onProgress?.(10);
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      onProgress?.(30);

      // Determine file extension
      const extension = this.getFileExtension(imageUri);
      const fileName = `${imageId}.${extension}`;
      const filePath = `${userId}/${draftId}/${fileName}`;

      // Convert base64 to ArrayBuffer
      const arrayBuffer = decode(base64);

      onProgress?.(50);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, arrayBuffer, {
          contentType: this.getMimeType(extension),
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      onProgress?.(80);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      onProgress?.(100);

      return { url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { url: '', error: error.message || 'Upload failed' };
    }
  }

  /**
   * Upload multiple images with progress tracking
   */
  static async uploadMultipleImages(
    images: Array<{ uri: string; id: string }>,
    draftId: string,
    onProgress?: (imageId: string, progress: number) => void,
    onComplete?: (imageId: string, url: string) => void,
    onError?: (imageId: string, error: string) => void
  ): Promise<UploadProgress[]> {
    const results: UploadProgress[] = [];

    for (const image of images) {
      let attempt = 0;
      let success = false;
      let uploadResult: { url: string; error?: string } = { url: '' };

      // Retry logic with exponential backoff
      while (attempt < this.MAX_RETRIES && !success) {
        uploadResult = await this.uploadImage(
          image.uri,
          image.id,
          draftId,
          (progress) => {
            onProgress?.(image.id, progress);
          }
        );

        if (uploadResult.url && !uploadResult.error) {
          success = true;
          onComplete?.(image.id, uploadResult.url);
        } else {
          attempt++;
          if (attempt < this.MAX_RETRIES) {
            // Exponential backoff
            await this.delay(this.RETRY_DELAY * Math.pow(2, attempt - 1));
          }
        }
      }

      results.push({
        imageId: image.id,
        progress: success ? 100 : 0,
        uploaded: success,
        url: uploadResult.url,
        error: success ? undefined : uploadResult.error,
      });

      if (!success) {
        onError?.(image.id, uploadResult.error || 'Upload failed after retries');
      }
    }

    return results;
  }

  /**
   * Delete an image from Supabase Storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(imageUrl);
      if (!filePath) {
        throw new Error('Invalid image URL');
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Delete multiple images
   */
  static async deleteMultipleImages(imageUrls: string[]): Promise<boolean> {
    try {
      const filePaths = imageUrls
        .map((url) => this.extractFilePathFromUrl(url))
        .filter((path): path is string => path !== null);

      if (filePaths.length === 0) {
        return true;
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      return false;
    }
  }

  /**
   * Check if storage bucket is accessible
   */
  static async checkStorageAccess(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.getBucket(this.BUCKET_NAME);
      return !error && data !== null;
    } catch (error) {
      console.error('Storage access check failed:', error);
      return false;
    }
  }

  /**
   * Get file extension from URI
   */
  private static getFileExtension(uri: string): string {
    const match = uri.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    return match ? match[1].toLowerCase() : 'jpg';
  }

  /**
   * Get MIME type from extension
   */
  private static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Extract file path from Supabase public URL
   */
  private static extractFilePathFromUrl(url: string): string | null {
    try {
      // URL format: https://{project}.supabase.co/storage/v1/object/public/images/{path}
      const match = url.match(/\/images\/(.+)$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delay helper for retry logic
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate image size (max 10MB)
   */
  static async validateImageSize(uri: string, maxSizeMB: number = 10): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && 'size' in fileInfo) {
        const sizeMB = fileInfo.size / (1024 * 1024);
        return sizeMB <= maxSizeMB;
      }
      return false;
    } catch (error) {
      console.error('Error validating image size:', error);
      return false;
    }
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(
    uri: string
  ): Promise<{ width: number; height: number } | null> {
    try {
      // This would require expo-image-manipulator or similar
      // For now, return null - can be implemented if needed
      return null;
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return null;
    }
  }
}

