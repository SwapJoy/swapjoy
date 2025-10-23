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
        .select('id, embedding, price, title, description, category_id')
        .eq('user_id', userId)
        .eq('status', 'available')
        .not('embedding', 'is', null);

      if (userItemsError || !userItems || userItems.length === 0) {
        console.log('No user items found, using fallback recommendations');
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

      // Calculate total value of user's items
      const totalUserValue = userItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
      console.log('Total user items value:', totalUserValue);
      
      // Find similar items using vector similarity
      const allRecommendations = [];
      
      for (const userItem of userItems) {
        // Use total value for better matching
        const minValue = Math.max(0, totalUserValue * 0.3); // 30% of total value
        const maxValue = totalUserValue * 1.5; // Up to 1.5x total value
        
        console.log(`Searching for items similar to ${userItem.title} ($${userItem.price}) with value range $${minValue}-$${maxValue}`);
        
        const { data: similarItems, error: similarError } = await client.rpc('match_items', {
          query_embedding: userItem.embedding,
          match_threshold: 0.6, // 60% similarity threshold
          match_count: Math.ceil(limit / userItems.length),
          min_value: minValue,
          exclude_user_id: userId
        });

        if (!similarError && similarItems) {
          // Filter out items that are too expensive
          const filteredItems = similarItems.filter((item: any) => 
            parseFloat(item.price) <= maxValue
          );
          
          console.log(`Found ${filteredItems.length} items within price range for ${userItem.title}`);
          
          // Add category bonus for favorite categories
          const enhancedItems = filteredItems.map((item: any) => ({
            ...item,
            category_bonus: favoriteCategories.includes(item.category_id) ? 0.2 : 0,
            overall_score: item.similarity + (favoriteCategories.includes(item.category_id) ? 0.2 : 0)
          }));
          
          allRecommendations.push(...enhancedItems);
        }
      }

      // Generate virtual bundles from user's items
      const virtualBundles = await this.generateVirtualBundles(client, userItems, userId, limit, totalUserValue);
      allRecommendations.push(...virtualBundles);

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

    const { data, error } = await query;
    
    if (error) {
      console.error('Fallback query error:', error);
      return { data: null, error };
    }


    return { data, error: null };
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
        .select('price')
        .eq('user_id', userId)
        .not('price', 'is', null);

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

      const avgValue = userItems.reduce((sum, item) => sum + (item.price || 0), 0) / userItems.length;
      const minValue = avgValue * 0.7;
      const maxValue = avgValue * 1.3;

      const query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .gte('price', minValue)
        .lte('price', maxValue)
        .order('created_at', { ascending: false })
        .limit(limit);

      return await query;
    });
  }

  // Generate virtual bundles from user's items
  static async generateVirtualBundles(client: any, userItems: any[], userId: string, limit: number, userTotalValue: number) {
    if (userItems.length < 2) {
      return []; // Need at least 2 items to create bundles
    }

    const bundles = [];
    const maxBundles = Math.min(3, Math.floor(limit / 3)); // Generate up to 3 bundles

    // Create bundles by combining user's items
    for (let i = 0; i < Math.min(maxBundles, userItems.length - 1); i++) {
      const item1 = userItems[i];
      const item2 = userItems[i + 1];
      
      // Calculate bundle embedding by averaging
      const bundleEmbedding = this.averageEmbeddings([
        item1.embedding,
        item2.embedding
      ]);

      // Calculate bundle value and discount
      const totalValue = (item1.price || 0) + (item2.price || 0);
      const bundleDiscount = Math.min(totalValue * 0.1, 100); // 10% discount, max $100
      const bundleValue = totalValue - bundleDiscount;

      // Find similar items that could be bundled together
      const { data: similarItems1, error: error1 } = await client.rpc('match_items', {
        query_embedding: item1.embedding,
        match_threshold: 0.6,
        match_count: 3,
        min_value: item1.price * 0.5,
        exclude_user_id: userId
      });

      const { data: similarItems2, error: error2 } = await client.rpc('match_items', {
        query_embedding: item2.embedding,
        match_threshold: 0.6,
        match_count: 3,
        min_value: item2.price * 0.5,
        exclude_user_id: userId
      });

      if (!error1 && !error2 && similarItems1 && similarItems2) {
        // Create bundles by combining similar items
        for (const itemA of similarItems1.slice(0, 2)) {
          for (const itemB of similarItems2.slice(0, 2)) {
            if (itemA.id !== itemB.id) {
              const bundleTotalValue = parseFloat(itemA.price) + parseFloat(itemB.price);
              const bundleDiscount = Math.min(bundleTotalValue * 0.1, 100);
              const bundleValue = bundleTotalValue - bundleDiscount;

              // Only create bundles within reasonable price range (80% to 120% of your total value)
              if (bundleValue >= userTotalValue * 0.8 && bundleValue <= userTotalValue * 1.2) {
                const bundle = {
                  id: `bundle_${itemA.id}_${itemB.id}`,
                  title: `${itemA.title} + ${itemB.title}`,
                  description: `Bundle: ${itemA.title} and ${itemB.title}`,
                  price: bundleValue,
                  is_bundle: true,
                  bundle_items: [itemA, itemB],
                  similarity_score: (itemA.similarity + itemB.similarity) / 2,
                  overall_score: (itemA.similarity + itemB.similarity) / 2 + 0.1,
                  category_id: itemA.category_id,
                  user_id: itemA.user_id, // Use the first item's owner
                  created_at: new Date().toISOString(),
                  status: 'available'
                };

                bundles.push(bundle);
              }
            }
          }
        }
      }
    }

    return bundles;
  }

  // Helper method to average embeddings
  static averageEmbeddings(embeddings: number[][]) {
    if (embeddings.length === 0) return [];
    if (embeddings.length === 1) return embeddings[0];

    const dimension = embeddings[0].length;
    const averaged = new Array(dimension).fill(0);

    for (let i = 0; i < dimension; i++) {
      for (const embedding of embeddings) {
        averaged[i] += embedding[i];
      }
      averaged[i] /= embeddings.length;
    }

    return averaged;
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


  // Create sample items for specific user
  static async createSampleItemsForUser(userId: string = '04274bdc-38e0-43ef-9873-344ee59bf0bf') {
    return this.authenticatedCall(async (client) => {
      const sampleItems = [
        {
          title: 'MacBook Pro 13" 2020',
          description: 'Excellent condition MacBook Pro with M1 chip, 8GB RAM, 256GB SSD. Perfect for work and creative projects.',
          price: 1200,
          condition: 'excellent',
          status: 'available'
        },
        {
          title: 'Nikon D3500 Camera Kit',
          description: 'Professional DSLR camera with 18-55mm lens. Great for photography beginners and enthusiasts.',
          price: 450,
          condition: 'good',
          status: 'available'
        },
        {
          title: 'Vintage Leather Jacket',
          description: 'Classic brown leather jacket, size M. Timeless style, well-maintained with minor wear.',
          price: 180,
          condition: 'good',
          status: 'available'
        }
      ];

      const results = [];
      
      for (const item of sampleItems) {
        // First, get a random category ID from existing categories
        const { data: categories, error: catError } = await client
          .from('categories')
          .select('id')
          .limit(1);
        
        if (catError || !categories || categories.length === 0) {
          console.error('No categories found, skipping item:', item.title);
          continue;
        }

        const { data: newItem, error: itemError } = await client
          .from('items')
          .insert({
            ...item,
            user_id: userId,
            category_id: categories[0].id
          })
          .select()
          .single();

        if (itemError) {
          console.error('Error creating item:', item.title, itemError);
          results.push({ item: item.title, success: false, error: itemError.message });
        } else {
          console.log('Created item for user:', userId, item.title, 'with price:', item.price);
          results.push({ item: item.title, success: true, data: newItem });
        }
      }

      return { data: results, error: null };
    });
  }

  // Assign existing items to user for testing
  static async assignItemsToUser(userId: string) {
    return this.authenticatedCall(async (client) => {
      // Get 2-3 random items that don't belong to any user
      const { data: availableItems, error: itemsError } = await client
        .from('items')
        .select('id, title, price')
        .is('user_id', null)
        .limit(3);

      if (itemsError || !availableItems || availableItems.length === 0) {
        console.log('No available items found to assign');
        return { data: { message: 'No available items found' }, error: null };
      }

      const results = [];
      
      for (const item of availableItems) {
        const { error: updateError } = await client
          .from('items')
          .update({ user_id: userId })
          .eq('id', item.id);

        if (updateError) {
          console.error('Error assigning item:', item.title, updateError);
          results.push({ item: item.title, success: false, error: updateError.message });
        } else {
          console.log('Assigned item to user:', item.title, 'Price:', item.price);
          results.push({ item: item.title, success: true, price: item.price });
        }
      }

      return { data: results, error: null };
    });
  }

  // Create sample items for testing
  static async createSampleItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      const sampleItems = [
        {
          title: 'MacBook Pro 13" 2020',
          description: 'Excellent condition MacBook Pro with M1 chip, 8GB RAM, 256GB SSD. Perfect for work and creative projects.',
          price: 1200,
          condition: 'excellent',
          category_id: 'electronics', // We'll need to get actual category ID
          status: 'available'
        },
        {
          title: 'Nikon D3500 Camera Kit',
          description: 'Professional DSLR camera with 18-55mm lens. Great for photography beginners and enthusiasts.',
          price: 450,
          condition: 'good',
          category_id: 'electronics',
          status: 'available'
        },
        {
          title: 'Vintage Leather Jacket',
          description: 'Classic brown leather jacket, size M. Timeless style, well-maintained with minor wear.',
          price: 180,
          condition: 'good',
          category_id: 'clothing',
          status: 'available'
        }
      ];

      const results = [];
      
      for (const item of sampleItems) {
        // First, get a random category ID from existing categories
        const { data: categories, error: catError } = await client
          .from('categories')
          .select('id')
          .limit(1);
        
        if (catError || !categories || categories.length === 0) {
          console.error('No categories found, skipping item:', item.title);
          continue;
        }

        const { data: newItem, error: itemError } = await client
          .from('items')
          .insert({
            ...item,
            user_id: userId,
            category_id: categories[0].id
          })
          .select()
          .single();

        if (itemError) {
          console.error('Error creating item:', item.title, itemError);
          results.push({ item: item.title, success: false, error: itemError.message });
        } else {
          console.log('Created item:', item.title, 'with price:', item.price);
          results.push({ item: item.title, success: true, data: newItem });
        }
      }

      return { data: results, error: null };
    });
  }

  // Get user's items for profile display
  static async getUserItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      const { data: items, error } = await client
        .from('items')
        .select('*, item_images(image_url), categories(name)')
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user items:', error);
        return { data: null, error };
      }

      console.log('User items:', items?.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        condition: item.condition
      })));

      return { data: items, error: null };
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
