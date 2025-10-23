import { supabase } from '../lib/supabase';
import { AuthService } from './auth';

export class ApiService {
  // Get authenticated Supabase client
  private static async getAuthenticatedClient() {
    const accessToken = await AuthService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available. Please sign in.');
    }

    // Return the existing client - it should already have the session set
    // The session is managed by AuthService and should be automatically set
    return supabase;
  }

  // Generic authenticated API call wrapper
  static async authenticatedCall<T>(
    apiCall: (client: typeof supabase) => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const client = await this.getAuthenticatedClient();
      return await apiCall(client);
    } catch (error: any) {
      console.error('API call failed:', error);
      return { data: null, error: { message: error.message || 'API call failed' } };
    }
  }

  // Example authenticated API methods
  static async getProfile() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('users')
        .select('*')
        .single();
    });
  }

  static async updateProfile(updates: Partial<{
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    profile_image_url: string;
  }>) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('users')
        .update(updates)
        .select()
        .single();
    });
  }

  static async getItems() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
    });
  }

  // AI-Powered Vector-Based Recommendations
  static async getTopPicksForUser(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      // Get user's items to find similar matches
      const { data: userItems, error: userItemsError } = await client
        .from('items')
        .select('id, embedding, estimated_value')
        .eq('user_id', userId)
        .eq('status', 'available')
        .not('embedding', 'is', null);

      if (userItemsError || !userItems || userItems.length === 0) {
        // Fallback to category-based recommendations
        return this.getFallbackRecommendations(client, userId, limit);
      }

      // Get user's favorite categories for additional filtering
      const { data: user, error: userError } = await client
        .from('users')
        .select('favorite_categories')
        .eq('id', userId)
        .single();

      const favoriteCategories = user?.favorite_categories || [];

      // Find similar items using vector similarity
      const allRecommendations = [];
      
      for (const userItem of userItems) {
        const minValue = Math.max(0, userItem.estimated_value * 0.5); // 50% of user's item value
        const maxValue = userItem.estimated_value * 2; // Up to 2x value
        
        const { data: similarItems, error: similarError } = await client.rpc('match_items', {
          query_embedding: userItem.embedding,
          match_threshold: 0.6, // 60% similarity threshold
          match_count: Math.ceil(limit / userItems.length),
          min_value: minValue,
          exclude_user_id: userId
        });

        if (!similarError && similarItems) {
          // Add category bonus for favorite categories
          const enhancedItems = similarItems.map((item: any) => ({
            ...item,
            category_bonus: favoriteCategories.includes(item.category_id) ? 0.2 : 0,
            overall_score: item.similarity + (favoriteCategories.includes(item.category_id) ? 0.2 : 0)
          }));
          
          allRecommendations.push(...enhancedItems);
        }
      }

      // Remove duplicates and sort by overall score
      const uniqueItems = this.deduplicateAndSort(allRecommendations);
      
      // Get full item details for top recommendations
      if (uniqueItems.length > 0) {
        const itemIds = uniqueItems.slice(0, limit).map((item: any) => item.id);
        
        const { data: fullItems, error: fullItemsError } = await client
          .from('items')
          .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .in('id', itemIds);

        if (!fullItemsError && fullItems) {
          // Add similarity scores to the results
          const itemsWithScores = fullItems.map(item => {
            const similarityData = uniqueItems.find((u: any) => u.id === item.id);
            return {
              ...item,
              similarity_score: similarityData?.similarity || 0,
              overall_score: similarityData?.overall_score || 0
            };
          });

          return { data: itemsWithScores, error: null };
        }
      }

      // Fallback if no vector matches found
      return this.getFallbackRecommendations(client, userId, limit);
    });
  }

  // Fallback method for when vector search fails
  static async getFallbackRecommendations(client: any, userId: string, limit: number) {
    const { data: user, error: userError } = await client
      .from('users')
      .select('favorite_categories')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { data: null, error: 'User not found' };
    }

    const query = client
      .from('items')
      .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
      .in('category_id', user.favorite_categories || [])
      .eq('status', 'available')
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return await query;
  }

  // Helper method to deduplicate and sort recommendations
  static deduplicateAndSort(items: any[]) {
    const seen = new Set();
    const unique = items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    
    return unique.sort((a, b) => (b.overall_score || b.similarity) - (a.overall_score || a.similarity));
  }

  static async getSimilarCostItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      // Get user's average item value
      const { data: userItems, error: userError } = await client
        .from('items')
        .select('estimated_value')
        .eq('user_id', userId)
        .not('estimated_value', 'is', null);

      if (userError || !userItems || userItems.length === 0) {
        // If no user items, use a default range
        const query = client
          .from('items')
          .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .eq('status', 'available')
          .neq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        return await query;
      }

      const avgValue = userItems.reduce((sum, item) => sum + (item.estimated_value || 0), 0) / userItems.length;
      const minValue = avgValue * 0.7;
      const maxValue = avgValue * 1.3;

      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .gte('estimated_value', minValue)
        .lte('estimated_value', maxValue)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  static async getSimilarCategoryItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      // Get user's favorite categories
      const { data: user, error: userError } = await client
        .from('users')
        .select('favorite_categories')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { data: null, error: 'User not found' };
      }

      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .in('category_id', user.favorite_categories || [])
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  static async getRecentlyAddedItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  static async getRandomItems(userId: string, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  static async createItem(itemData: {
    title: string;
    description: string;
    category_id?: string;
    condition: string;
    estimated_value?: number;
    location_lat?: number;
    location_lng?: number;
  }) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('items')
        .insert(itemData)
        .select()
        .single();
    });
  }

  static async updateItem(itemId: string, updates: any) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
    });
  }

  static async deleteItem(itemId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('items')
        .delete()
        .eq('id', itemId);
    });
  }

  static async getOffers() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('offers')
        .select(`
          *,
          sender:users!offers_sender_id_fkey(*),
          receiver:users!offers_receiver_id_fkey(*),
          offer_items(
            *,
            item:items(*)
          )
        `)
        .order('created_at', { ascending: false });
    });
  }

  static async createOffer(offerData: {
    receiver_id: string;
    message?: string;
    top_up_amount?: number;
    offer_items: Array<{
      item_id: string;
      side: 'offered' | 'requested';
    }>;
  }) {
    return this.authenticatedCall(async (client) => {
      const { data: offer, error: offerError } = await client
        .from('offers')
        .insert({
          receiver_id: offerData.receiver_id,
          message: offerData.message,
          top_up_amount: offerData.top_up_amount || 0,
        })
        .select()
        .single();

      if (offerError) {
        return { data: null, error: offerError };
      }

      // Insert offer items
      const { data: offerItems, error: itemsError } = await client
        .from('offer_items')
        .insert(
          offerData.offer_items.map(item => ({
            offer_id: offer.id,
            item_id: item.item_id,
            side: item.side,
          }))
        )
        .select();

      if (itemsError) {
        return { data: null, error: itemsError };
      }

      return { data: { ...offer, offer_items: offerItems }, error: null };
    });
  }

  static async updateOfferStatus(offerId: string, status: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('offers')
        .update({ 
          status,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();
    });
  }

  static async getNotifications() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
    });
  }

  static async markNotificationAsRead(notificationId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();
    });
  }

  static async getFavorites() {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('favorites')
        .select(`
          *,
          item:items(*)
        `)
        .order('created_at', { ascending: false });
    });
  }

  static async addToFavorites(itemId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('favorites')
        .insert({ item_id: itemId })
        .select()
        .single();
    });
  }

  static async removeFromFavorites(itemId: string) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('favorites')
        .delete()
        .eq('item_id', itemId);
    });
  }

  // User Stats - Ultra Simple Version
  static async getUserStats(userId: string) {
    return this.authenticatedCall(async (client) => {
      console.log('ApiService: Getting user stats for user:', userId);
      
      // Just get items count - simplest possible query
      const { data: items, error: itemsError } = await client
        .from('items')
        .select('id')
        .eq('user_id', userId);

      console.log('ApiService: Items result:', { items, itemsError });

      // Return simple stats - don't try to get offers data yet
      const result = {
        items_listed: items?.length || 0,
        items_swapped: 0, // Simplified for now
        total_offers: 0,   // Simplified for now
        success_rate: 0,   // Simplified for now
      };

      console.log('ApiService: Returning stats:', result);

      return {
        data: result,
        error: null,
      };
    });
  }

  // User Ratings - Ultra Simple Version
  static async getUserRatings(userId: string) {
    return this.authenticatedCall(async (client) => {
      console.log('ApiService: Getting user ratings for user:', userId);
      
      // Just return default values for now - no complex queries
      const result = {
        average_rating: 0,
        total_ratings: 0,
      };

      console.log('ApiService: Returning ratings:', result);

      return {
        data: result,
        error: null,
      };
    });
  }

  // Generate embeddings for items that don't have them
  static async generateEmbeddingsForItems() {
    return this.authenticatedCall(async (client) => {
      // Get items without embeddings
      const { data: itemsWithoutEmbeddings, error: itemsError } = await client
        .from('items')
        .select('id, title, description, category_id')
        .is('embedding', null)
        .eq('status', 'available')
        .limit(10); // Process 10 items at a time

      if (itemsError || !itemsWithoutEmbeddings || itemsWithoutEmbeddings.length === 0) {
        return { data: { message: 'No items need embeddings', results: [], processed: 0 }, error: null };
      }

      const results = [];
      
      for (const item of itemsWithoutEmbeddings) {
        try {
          // Call the Edge Function to generate embedding
          const { data: embeddingResult, error: embeddingError } = await client.functions.invoke('generate-embedding', {
            body: { itemId: item.id }
          });

          if (embeddingError) {
            console.error(`Failed to generate embedding for item ${item.id}:`, embeddingError);
            results.push({ itemId: item.id, success: false, error: embeddingError.message });
          } else {
            results.push({ itemId: item.id, success: true });
          }
        } catch (error) {
          console.error(`Error processing item ${item.id}:`, error);
          results.push({ itemId: item.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      return { data: { results, processed: itemsWithoutEmbeddings.length, message: 'Embeddings processed' }, error: null };
    });
  }
}
