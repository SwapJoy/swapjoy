import { ApiService } from './api';

/**
 * Service for category-related operations
 * Extracted from ApiService for better organization
 */
export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories() {
    return ApiService.getCategories();
  }

  /**
   * Get category ID to name mapping
   */
  static async getCategoryIdToNameMap() {
    return ApiService.getCategoryIdToNameMap();
  }

  /**
   * Get top categories
   */
  static async getTopCategories(userId: string, limit: number = 6) {
    return ApiService.getTopCategoriesSafe(userId, limit);
  }
}
