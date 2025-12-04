import { ApiService } from './api';

/**
 * Service for user-related operations
 * Extracted from ApiService for better organization
 */
export class UserService {
  /**
   * Get user profile
   */
  static async getProfile() {
    return ApiService.getProfile();
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<{
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    profile_image_url: string;
    preferred_radius_km: number | null;
    favorite_categories: string[] | null;
    preferred_currency: string;
  }>) {
    return ApiService.updateProfile(updates);
  }

  /**
   * Get user stats
   */
  static async getUserStats(userId: string) {
    return ApiService.getUserStats(userId);
  }

  /**
   * Get user ratings
   */
  static async getUserRatings(userId: string) {
    return ApiService.getUserRatings(userId);
  }
}
