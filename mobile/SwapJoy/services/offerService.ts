import { ApiService } from './api';

/**
 * Service for offer-related operations
 * Extracted from ApiService for better organization
 */
export class OfferService {
  /**
   * Get offers (sent or received)
   */
  static async getOffers(userId?: string, type?: 'sent' | 'received') {
    return ApiService.getOffers(userId, type);
  }

  /**
   * Create a new offer
   */
  static async createOffer(offerData: {
    receiver_id: string;
    message?: string;
    top_up_amount?: number;
    offer_items: Array<{
      item_id: string;
      side: 'offered' | 'requested';
    }>;
  }) {
    return ApiService.createOffer(offerData);
  }

  /**
   * Update offer status
   */
  static async updateOfferStatus(offerId: string, status: string) {
    return ApiService.updateOfferStatus(offerId, status);
  }
}
