import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { AuthService } from './auth';
import { ApiService } from './api';

export interface UploadProgress {
  imageId: string;
  progress: number;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export class ImageUploadService {
  static readonly BUCKET_NAME = 'images';

  /**
   * Upload a single image to Supabase Storage
   */
  static async uploadImage(
    imageUri: string,
    imageId: string,
    userId: string,
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
      const filePath = `${userId}/${fileName}`;

      // Convert base64 to ArrayBuffer
      const arrayBuffer = decode(base64);

      onProgress?.(50);

      // Get authenticated Supabase client to ensure session is set
      // This is critical after logout/login to ensure fresh session
      const client = await ApiService.getAuthenticatedClient();

      // Upload to Supabase Storage
      // Use upsert: true to allow overwriting if file already exists
      // This handles the case where upload completes while user navigates away
      const { data, error } = await client.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, arrayBuffer, {
          contentType: this.getMimeType(extension),
          cacheControl: '3600',
          upsert: true, // Allow overwriting existing files
        });

      if (error) {
        console.error('[ImageUploadService] Upload error:', error);
        throw error;
      }

      onProgress?.(80);

      // Get public URL
      const { data: urlData } = client.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      onProgress?.(100);

      return { url: urlData.publicUrl };
    } catch (error: any) {
      // Check if this is a duplicate error - file already exists
      const isDuplicateError = 
        error?.message?.includes('already exists') || 
        error?.message?.includes('Duplicate') ||
        error?.message?.includes('resource already exists') ||
        error?.statusCode === '409' ||
        error?.statusCode === 409 ||
        error?.status === 409 ||
        (error?.name === 'StorageApiError' && error?.statusCode === '409');
      
      if (isDuplicateError) {
        console.log(`[ImageUploadService] File already exists (duplicate error), getting existing URL. Error:`, {
          message: error?.message,
          statusCode: error?.statusCode,
          status: error?.status,
        });
        try {
          // Get authenticated client again
          const client = await ApiService.getAuthenticatedClient();
          const user = await AuthService.getCurrentUser();
          if (!user) {
            return { url: '', error: 'User not authenticated' };
          }
          
          // Determine file extension and path (reuse logic from above)
          const extension = ImageUploadService.getFileExtension(imageUri);
          const fileName = `${imageId}.${extension}`;
          const filePath = `${user.id}/${fileName}`;
          
          // Get the public URL for the existing file
          const { data: urlData } = client.storage
            .from(ImageUploadService.BUCKET_NAME)
            .getPublicUrl(filePath);
          
          onProgress?.(100);
          console.log(`[ImageUploadService] Successfully retrieved existing file URL: ${urlData.publicUrl}`);
          return { url: urlData.publicUrl };
        } catch (urlError) {
          console.error('[ImageUploadService] Could not get existing file URL:', urlError);
          return { url: '', error: 'File exists but could not get URL' };
        }
      }
      
      console.error('Error uploading image:', error);
      return { url: '', error: error?.message || 'Upload failed' };
    }
  }

  /**
   * Upload multiple images with progress tracking (no automatic retries)
   */
  static async uploadMultipleImages(
    images: Array<{ uri: string; id: string }>,
    userId: string,
    onProgress?: (imageId: string, progress: number) => void,
    onComplete?: (imageId: string, url: string) => void,
    onError?: (imageId: string, error: string) => void
  ): Promise<UploadProgress[]> {
    const results: UploadProgress[] = [];

    for (const image of images) {
      // Single attempt - no automatic retries
      const uploadResult = await this.uploadImage(
        image.uri,
        image.id,
        userId,
        (progress) => {
          onProgress?.(image.id, progress);
        }
      );

      const success = uploadResult.url && !uploadResult.error;
      
      if (success) {
        onComplete?.(image.id, uploadResult.url);
      } else {
        onError?.(image.id, uploadResult.error || 'Upload failed');
      }

      results.push({
        imageId: image.id,
        progress: success ? 100 : 0,
        uploaded: success,
        url: uploadResult.url,
        error: success ? undefined : uploadResult.error,
      });
    }

    return results;
  }

  /**
   * Retry uploading a single image
   */
  static async retryUploadImage(
    imageUri: string,
    imageId: string,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; error?: string }> {
    // Clear any previous error state by attempting upload again
    return this.uploadImage(imageUri, imageId, userId, onProgress);
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

      // Get authenticated client to ensure session is set
      const client = await ApiService.getAuthenticatedClient();

      const { error } = await client.storage
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

      // Get authenticated client to ensure session is set
      const client = await ApiService.getAuthenticatedClient();

      const { error } = await client.storage
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
      // Get authenticated client to ensure session is set
      const client = await ApiService.getAuthenticatedClient();
      const { data, error } = await client.storage.getBucket(this.BUCKET_NAME);
      return !error && data !== null;
    } catch (error) {
      console.error('Storage access check failed:', error);
      return false;
    }
  }

  /**
   * Get file extension from URI
   */
  static getFileExtension(uri: string): string {
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

