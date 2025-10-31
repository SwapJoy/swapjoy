import { ApiService } from './api';

/**
 * Service for favorite-related operations
 * Extracted from ApiService for better organization
 */
export class FavoriteService {
  /**
   * Get all favorites
   */
  static async getFavorites() {
    return ApiService.getFavorites();
  }

  /**
   * Add item to favorites
   */
  static async addToFavorites(itemId: string) {
    return ApiService.addToFavorites(itemId);
  }

  /**
   * Remove item from favorites
   */
  static async removeFromFavorites(itemId: string) {
    return ApiService.removeFromFavorites(itemId);
  }

  /**
   * Get saved items
   */
  static async getSavedItems() {
    return ApiService.getSavedItems();
  }
}
