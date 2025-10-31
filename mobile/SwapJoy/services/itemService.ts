import { ApiService } from './api';

/**
 * Service for item-related operations
 * Extracted from ApiService for better organization
 */
export class ItemService {
  /**
   * Get items by category with pagination
   */
  static async getItemsByCategory(userId: string, categoryId: string, page: number = 1, limit: number = 10) {
    return ApiService.getItemsByCategorySafe(userId, categoryId, page, limit);
  }

  /**
   * Get other items with pagination (for grid display)
   */
  static async getOtherItems(userId: string, page: number = 1, limit: number = 10) {
    return ApiService.getOtherItemsSafe(userId, page, limit);
  }

  /**
   * Get recently listed items
   */
  static async getRecentlyListed(userId: string, limit: number = 10) {
    return ApiService.getRecentlyListedSafe(userId, limit);
  }

  /**
   * Get top AI picks for user
   */
  static async getTopPicks(userId: string, limit: number = 10) {
    return ApiService.getTopPicksForUserSafe(userId, limit);
  }

  /**
   * Get item by ID
   */
  static async getItemById(itemId: string) {
    return ApiService.getItemById(itemId);
  }

  /**
   * Get user's published items
   */
  static async getUserPublishedItems(userId: string) {
    return ApiService.getUserPublishedItems(userId);
  }

  /**
   * Get user's draft items
   */
  static async getUserDraftItems(userId: string) {
    return ApiService.getUserDraftItems(userId);
  }

  /**
   * Create a new item
   */
  static async createItem(itemData: {
    title: string;
    description: string;
    category_id?: string | null;
    condition: string;
    price?: number;
    currency?: string;
    location_lat?: number;
    location_lng?: number;
  }) {
    return ApiService.createItem(itemData);
  }

  /**
   * Update an existing item
   */
  static async updateItem(itemId: string, updates: Partial<{
    title: string;
    description: string;
    category_id: string | null;
    condition: string;
    price: number;
    currency: string;
    status: string;
    location_lat: number | null;
    location_lng: number | null;
  }>) {
    return ApiService.updateItem(itemId, updates);
  }

  /**
   * Delete an item
   */
  static async deleteItem(itemId: string) {
    return ApiService.deleteItem(itemId);
  }
}
