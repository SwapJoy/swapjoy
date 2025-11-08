import { ApiService } from './api';
import { AppLanguage, DEFAULT_LANGUAGE } from '../types/language';

/**
 * Service for category-related operations
 * Extracted from ApiService for better organization
 */
export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories(lang: AppLanguage = DEFAULT_LANGUAGE) {
    return ApiService.getCategories(lang);
  }

  /**
   * Get category ID to name mapping
   */
  static async getCategoryIdToNameMap(lang: AppLanguage = DEFAULT_LANGUAGE) {
    return ApiService.getCategoryIdToNameMap(lang);
  }

  /**
   * Get top categories
   */
  static async getTopCategories(userId: string, limit: number = 6, lang: AppLanguage = DEFAULT_LANGUAGE) {
    return ApiService.getTopCategoriesSafe(userId, limit, lang);
  }
}
