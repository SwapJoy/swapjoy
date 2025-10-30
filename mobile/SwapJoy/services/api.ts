import { supabase } from '../lib/supabase';
import { AuthService } from './auth';
import { RedisCache } from './redisCache';

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
      // Ensure we fetch the row for the authenticated user only
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser?.id) {
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }
      return await client
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
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
  static async getTopPicksForUser(userId: string, limit: number = 10, options?: { bypassCache?: boolean }) {
    // Use Redis caching for expensive AI recommendations (graceful fallback if not available)
    return RedisCache.cache(
      'top-picks',
      [userId, limit],
      () => this.authenticatedCall(async (client) => {
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
      const allRecommendations: any[] = [];
      
      try {
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

        if (!similarError && similarItems && Array.isArray(similarItems)) {
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
        } else {
          console.log(`No similar items found for ${userItem.title} or error occurred:`, similarError);
        }
        }
      } catch (error) {
        console.error('Error processing user items for recommendations:', error);
      }

      // Generate virtual bundles from user's items
      try {
        const virtualBundles = await this.generateVirtualBundles(client, userItems, userId, limit, totalUserValue);
        console.log(`Generated ${virtualBundles.length} virtual bundles`);
        if (virtualBundles && Array.isArray(virtualBundles)) {
          allRecommendations.push(...virtualBundles);
        }
      } catch (error) {
        console.error('Error generating virtual bundles:', error);
      }

      // Remove duplicates and sort by overall score
      const uniqueItems = this.deduplicateAndSort(allRecommendations || []);
      
      // Separate bundles from single items
      const bundles = uniqueItems.filter((item: any) => item.is_bundle);
      const singleItemIds = uniqueItems
        .filter((item: any) => !item.is_bundle)
        .map((item: any) => item.id);
      
      const finalResults = [];
      
      // Get full item details for single items
      if (singleItemIds.length > 0) {
        console.log('API: Fetching items with IDs:', singleItemIds);
        
        // Fetch data separately and combine manually
        console.log('API: Fetching items separately for IDs:', singleItemIds);
        
        // Get items
        const { data: items, error: itemsError } = await client
          .from('items')
          .select('*')
          .in('id', singleItemIds);

        if (itemsError) {
          console.error('API: Error fetching items:', itemsError);
        }

        if (!itemsError && items) {
          console.log('API: Items fetched:', items.length);
          
          // Get images for these items
          const { data: images, error: imagesError } = await client
            .from('item_images')
            .select('item_id, image_url')
            .in('item_id', singleItemIds);

          if (imagesError) {
            console.error('API: Error fetching images:', imagesError);
          }

          // Get users for these items
          const userIds = [...new Set(items.map(item => item.user_id))];
          const { data: users, error: usersError } = await client
            .from('users')
            .select('id, username, first_name, last_name')
            .in('id', userIds);

          if (usersError) {
            console.error('API: Error fetching users:', usersError);
          }

          console.log('API: Images fetched:', images?.length || 0);
          console.log('API: Users fetched:', users?.length || 0);
          
          // Combine the data
          const itemsWithScores = items.map(item => {
            const similarityData = uniqueItems.find((u: any) => u.id === item.id);
            const itemImages = images?.filter(img => img.item_id === item.id) || [];
            const itemUser = users?.find(user => user.id === item.user_id);
            const imageUrl = itemImages[0]?.image_url || null;
            
            console.log('API: Item', item.title, '- imageUrl:', imageUrl, 'user:', itemUser?.username);
            
            return {
              ...item,
              image_url: imageUrl,
              item_images: itemImages,
              user: itemUser ? { // ensure consistent 'user' shape
                id: itemUser.id,
                username: itemUser.username,
                first_name: itemUser.first_name,
                last_name: itemUser.last_name,
              } : { id: item.user_id },
              similarity_score: similarityData?.similarity || 0,
              overall_score: similarityData?.overall_score || 0
            };
          });
          finalResults.push(...itemsWithScores);
        }
      }
      
      // Add bundles directly (they already have all needed data)
      finalResults.push(...bundles);
      
      // Fallback: also construct bundles from owners who have multiple items (single-owner bundles)
      try {
        const { data: ownerItems } = await client
          .from('items')
          .select('id, title, price, user_id, item_images(image_url)')
          .eq('status', 'available')
          .neq('user_id', userId)
          .limit(120);

        if (Array.isArray(ownerItems) && ownerItems.length > 0) {
          const byOwner: Record<string, any[]> = {};
          for (const it of ownerItems) {
            if (!byOwner[it.user_id]) byOwner[it.user_id] = [];
            byOwner[it.user_id].push(it);
          }

          let constructed = 0;
          for (const [owner, itemsArr] of Object.entries(byOwner)) {
            if (constructed >= 5) break;
            if ((itemsArr as any[]).length < 2) continue;

            // Sort by price desc to build stronger value bundles
            const sorted = [...(itemsArr as any[])].sort((a, b) => (b.price || 0) - (a.price || 0));
            const topPairs = sorted.slice(0, 4); // take top 4 to mix pairs
            for (let i = 0; i < topPairs.length - 1 && constructed < 5; i++) {
              const a = topPairs[i];
              const b = topPairs[i + 1];
              if (!a || !b) continue;

              const bundleTotalValue = (parseFloat(a.price) || 0) + (parseFloat(b.price) || 0);
              const bundleDiscount = Math.min(bundleTotalValue * 0.1, 100);
              const bundleValue = bundleTotalValue - bundleDiscount;
              const imageUrl = a.item_images?.[0]?.image_url || b.item_images?.[0]?.image_url || null;

              const bundle = {
                id: `owner_bundle_${owner}_${a.id}_${b.id}`,
                title: `${a.title} + ${b.title}`,
                description: `Bundle: ${a.title} and ${b.title}`,
                price: bundleValue,
                estimated_value: bundleValue,
                is_bundle: true,
                bundle_items: [a, b],
                similarity_score: 0.6, // heuristic baseline
                overall_score: 0.65, // slight boost to surface
                match_score: Math.round(0.65 * 100),
                reason: 'Same owner bundle - good combined value',
                category_id: null,
                user_id: owner,
                user: { id: owner },
                image_url: imageUrl,
                created_at: new Date().toISOString(),
                status: 'available'
              };

              finalResults.push(bundle);
              constructed++;
            }
          }
        }
      } catch (e) {
        console.log('Owner bundle fallback failed:', e);
      }
      
      console.log(`Final results: ${finalResults.length} items (${finalResults.filter(r => r.is_bundle).length} bundles, ${finalResults.filter(r => !r.is_bundle).length} single items)`);
      
      // Sort by overall score and limit results
      const sortedResults = finalResults
        .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
        .slice(0, limit);

      if (sortedResults.length > 0) {
        return { data: sortedResults, error: null };
      }

      // Fallback if no vector matches found
      return this.getFallbackRecommendations(client, userId, limit);
    }),
    options?.bypassCache === true
    );
  }

  // Ensure we always return a valid response
  static async getTopPicksForUserSafe(userId: string, limit: number = 10, options?: { bypassCache?: boolean }) {
    try {
      const result = await this.getTopPicksForUser(userId, limit, options);
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getTopPicksForUserSafe:', error);
      return {
        data: [],
        error: error
      };
    }
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
    const maxBundles = Math.min(5, Math.floor(limit / 2)); // Generate up to 5 bundles

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
      const { data: similarItems1 } = await client.rpc('match_items', {
        query_embedding: item1.embedding,
        match_threshold: 0.5,
        match_count: 5,
        min_value: (item1.price || 0) * 0.4,
        exclude_user_id: userId
      });

      const { data: similarItems2 } = await client.rpc('match_items', {
        query_embedding: item2.embedding,
        match_threshold: 0.5,
        match_count: 5,
        min_value: (item2.price || 0) * 0.4,
        exclude_user_id: userId
      });

      if (similarItems1 && similarItems2 && similarItems1.length > 0 && similarItems2.length > 0) {
        // Get full details for items to create bundles
        const allItemIds = [...(similarItems1 || []), ...(similarItems2 || [])].map((it: any) => it.id);
        const { data: fullItems } = await client
          .from('items')
          .select('*, item_images(image_url)')
          .in('id', allItemIds);

        if (fullItems) {
          // Create bundles by combining similar items
          for (const itemA of (similarItems1 || []).slice(0, 3)) {
            for (const itemB of (similarItems2 || []).slice(0, 3)) {
              if (itemA.id !== itemB.id) {
                const fullItemA = fullItems.find((it: any) => it.id === itemA.id);
                const fullItemB = fullItems.find((it: any) => it.id === itemB.id);
                
                if (fullItemA && fullItemB) {
                  // Only bundle items from the same owner
                  if (fullItemA.user_id !== fullItemB.user_id) {
                    continue;
                  }

                  const bundleTotalValue = parseFloat(itemA.price) + parseFloat(itemB.price);
                  const bundleDiscount2 = Math.min(bundleTotalValue * 0.1, 100);
                  const bundleValue2 = bundleTotalValue - bundleDiscount2;

                  // Relaxed price range (60% to 160% of your total value)
                  if (bundleValue2 >= userTotalValue * 0.6 && bundleValue2 <= userTotalValue * 1.6) {
                    const bundleOwnerId = fullItemA.user_id;
                    const imageA = fullItemA.item_images?.[0]?.image_url;
                    const imageB = fullItemB.item_images?.[0]?.image_url;
                    const imageUrl = imageA || imageB || 'https://via.placeholder.com/200x150';

                    const bundle = {
                      id: `bundle_${itemA.id}_${itemB.id}`,
                      title: `${itemA.title} + ${itemB.title}`,
                      description: `Bundle: ${itemA.title} and ${itemB.title}`,
                      price: bundleValue2,
                      estimated_value: bundleValue2,
                      is_bundle: true,
                      bundle_items: [fullItemA, fullItemB],
                      similarity_score: (itemA.similarity + itemB.similarity) / 2,
                      overall_score: (itemA.similarity + itemB.similarity) / 2 + 0.1,
                      match_score: Math.round(((itemA.similarity + itemB.similarity) / 2 + 0.1) * 100),
                      reason: `Great bundle match! Similar to your ${userItems.find(ui => ui.category_id === itemA.category_id)?.title || 'items'}`,
                      category_id: itemA.category_id,
                      user_id: bundleOwnerId,
                      user: { id: bundleOwnerId },
                      image_url: imageUrl,
                      created_at: new Date().toISOString(),
                      status: 'available'
                    };

                    bundles.push(bundle);
                    if (bundles.length >= maxBundles) break;
                  }
                }
              }
            }
            if (bundles.length >= maxBundles) break;
          }
        }
      }
    }

    console.log(`Generated ${bundles.length} bundles total`);
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

      const { data: items, error } = await client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .in('category_id', user.favorite_categories || [])
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return { data: [], error };
      
      // Flatten image URLs
      const itemsWithImages = items?.map(item => ({
        ...item,
        image_url: item.item_images?.[0]?.image_url || null
      }));

      return { data: itemsWithImages, error: null };
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
    category_id?: string | null;
    condition: string;
    price?: number;
    currency?: string;
    location_lat?: number;
    location_lng?: number;
  }) {
    return this.authenticatedCall(async (client) => {
      // Get current user
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await client
        .from('items')
        .insert({
          user_id: user.id,
          ...itemData,
          status: 'available',
        })
        .select()
        .single();
    });
  }

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

  static async getOffers(userId?: string, type?: 'sent' | 'received') {
    return this.authenticatedCall(async (client) => {
      let query = client
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

      if (userId && type === 'sent') {
        query = query.eq('sender_id', userId);
      } else if (userId && type === 'received') {
        query = query.eq('receiver_id', userId);
      }

      const { data, error } = await query;
      return { data, error } as any;
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
      // Ensure we have the authenticated user for RLS
      const user = await AuthService.getCurrentUser();
      if (!user?.id) {
        return { data: null, error: { message: 'Not authenticated' } } as any;
      }

      // Separate item ids by side for validation
      const offeredIds = offerData.offer_items.filter(i => i.side === 'offered').map(i => i.item_id);
      const requestedIds = offerData.offer_items.filter(i => i.side === 'requested').map(i => i.item_id);
      const distinctIds = Array.from(new Set([...offeredIds, ...requestedIds]));

      // Fetch items owners once
      const { data: itemsMeta, error: itemsMetaError } = await client
        .from('items')
        .select('id, user_id')
        .in('id', distinctIds);
      if (itemsMetaError) {
        return { data: null, error: itemsMetaError } as any;
      }
      if (!itemsMeta || itemsMeta.length !== distinctIds.length) {
        return { data: null, error: { message: 'Some items not found' } } as any;
      }

      const idToOwner: Record<string, string> = {};
      (itemsMeta || []).forEach((it: any) => { idToOwner[it.id] = it.user_id; });

      // Validate offered: must belong to sender
      const invalidOffered = offeredIds.filter(id => idToOwner[id] !== user.id);
      if (invalidOffered.length > 0) {
        return { data: null, error: { message: 'Offered items must belong to you' } } as any;
      }

      // Derive receiver from requested items' owner; must be a single owner
      const requestedOwnerIds = Array.from(new Set(requestedIds.map(id => idToOwner[id]))).filter(Boolean);
      if (requestedOwnerIds.length !== 1) {
        return { data: null, error: { message: 'Requested items must belong to a single user' } } as any;
      }
      const derivedReceiverId = requestedOwnerIds[0];
      if (derivedReceiverId === user.id) {
        return { data: null, error: { message: 'Cannot send offer to yourself' } } as any;
      }

      // Create offer with derived receiver id
      const { data: offer, error: offerError } = await client
        .from('offers')
        .insert({
          sender_id: user.id,
          receiver_id: derivedReceiverId,
          message: offerData.message,
          top_up_amount: offerData.top_up_amount || 0,
        })
        .select()
        .single();

      if (offerError || !offer) {
        return { data: null, error: offerError || { message: 'Failed to create offer' } } as any;
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
        // Best-effort cleanup if items insert fails
        try {
          await client.from('offers').delete().eq('id', offer.id);
        } catch {}
        return { data: null, error: itemsError } as any;
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
    // Cache user stats; compute counts for items and offers
    return RedisCache.cache(
      'user-stats',
      [userId],
      () => this.authenticatedCall(async (client) => {
        console.log('ApiService: Getting user stats for user:', userId);

        // Items listed count
        const { data: items, error: itemsError } = await client
          .from('items')
          .select('id')
          .eq('user_id', userId);

        // Offers sent count
        const { count: sentOffers } = await client
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id', userId);

        // Offers received count
        const { count: receivedOffers } = await client
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', userId);

        // Successful swaps: offers with status accepted where user involved
        const { count: successfulSwaps } = await client
          .from('offers')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'accepted')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        const totalOffers = (sentOffers || 0) + (receivedOffers || 0);
        const successRate = totalOffers > 0 ? Math.round(((successfulSwaps || 0) / totalOffers) * 100) : 0;

        const result = {
          items_listed: items?.length || 0,
          items_swapped: successfulSwaps || 0,
          total_offers: totalOffers,
          sent_offers: sentOffers || 0,
          received_offers: receivedOffers || 0,
          success_rate: successRate,
        } as any;

        console.log('ApiService: Returning stats:', result);

        return {
          data: result,
          error: null,
        };
      }),
      true
    );
  }

  // User Ratings - Ultra Simple Version
  static async getUserRatings(userId: string) {
    // Cache user ratings for 5 minutes
    return RedisCache.cache(
      'user-ratings',
      [userId],
      () => this.authenticatedCall(async (client) => {
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
    }),
    true // allow bypass flag as needed by caller (no TTL param anymore)
    );
  }


  // Cache invalidation methods
  static async invalidateUserCache(userId: string) {
    try {
      await Promise.all([
        RedisCache.delete('user-stats', userId),
        RedisCache.delete('user-ratings', userId),
        RedisCache.invalidatePattern(`top-picks:${userId}:*`),
        RedisCache.invalidatePattern(`similar-cost:${userId}:*`),
        RedisCache.invalidatePattern(`similar-categories:${userId}:*`),
        RedisCache.invalidatePattern(`recently-added:${userId}:*`),
      ]);
      console.log('Cache invalidated for user:', userId);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
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
        return { data: null, error: 'No available items found' };
      }

      const results: Array<{item: string; success: boolean; error?: string; price?: any}> = [];
      
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

      return { data: results as any, error: null };
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
      // Get user items with images using explicit foreign key name
      const { data: items, error } = await client
        .from('items')
        .select(`
          *,
          item_images!item_images_item_id_fkey(image_url),
          categories!inner(name)
        `)
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user items:', error);
        return { data: null, error };
      }

      // Flatten image URLs for easier access
      const itemsWithImages = items?.map(item => ({
        ...item,
        image_url: item.item_images?.[0]?.image_url || null,
        category_name: item.categories?.name || null
      }));

      console.log('User items:', itemsWithImages?.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        condition: item.condition,
        image_url: item.image_url
      })));

      return { data: itemsWithImages, error: null };
    });
  }

  // Explicit helpers for published and draft items
  static async getUserPublishedItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      const { data: items, error } = await client
        .from('items')
        .select(`*, item_images!item_images_item_id_fkey(image_url)`) 
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error } as any;

      const itemsWithImages = items?.map(item => ({
        ...item,
        image_url: item.item_images?.[0]?.image_url || null,
      }));

      return { data: itemsWithImages, error: null } as any;
    });
  }

  static async getUserDraftItems(userId: string) {
    return this.authenticatedCall(async (client) => {
      const { data: items, error } = await client
        .from('items')
        .select(`*, item_images!item_images_item_id_fkey(image_url)`) 
        .eq('user_id', userId)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      if (error) return { data: null, error } as any;

      const itemsWithImages = items?.map(item => ({
        ...item,
        image_url: item.item_images?.[0]?.image_url || null,
      }));

      return { data: itemsWithImages, error: null } as any;
    });
  }

  static async getSavedItems() {
    return this.authenticatedCall(async (client) => {
      const { data, error } = await client
        .from('favorites')
        .select(`id, item:items(*, item_images(image_url))`)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error } as any;

      const flattened = (data || []).map((fav: any) => ({
        ...fav.item,
        image_url: fav.item?.item_images?.[0]?.image_url || null,
      }));

      return { data: flattened, error: null } as any;
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

  // ============================
  // HOME SCREEN SECTION ENDPOINTS
  // ============================

  /**
   * Get recently listed items from the last month, sorted by relevance
   * Uses AI similarity scores when available
   */
  static async getRecentlyListed(userId: string, limit: number = 10) {
    // Bypass cache for recently listed to always get fresh data
    return this.authenticatedCall(async (client) => {
      // Calculate date for one month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Get user's items to calculate similarity
      const { data: userItems, error: userItemsError } = await client
        .from('items')
        .select('id, embedding, price, title, description, category_id')
        .eq('user_id', userId)
        .eq('status', 'available')
        .not('embedding', 'is', null);

      if (userItemsError || !userItems || userItems.length === 0) {
        // Fallback: just get recent items without AI scoring
        console.log('Fetching recently listed items (no AI scoring)...');
        const { data, error } = await client
          .from('items')
          .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
          .eq('status', 'available')
          .neq('user_id', userId)
          .gte('created_at', oneMonthAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(limit);

        console.log('Recently listed items fetched:', {
          count: data?.length || 0,
          error: error,
          itemIds: data?.map(item => item.id).slice(0, 5)
        });

        return { data, error };
      }

      // Get user's favorite categories for additional filtering
      const { data: user } = await client
        .from('users')
        .select('favorite_categories')
        .eq('id', userId)
        .single();

      const favoriteCategories = user?.favorite_categories || [];

      // Get recent items
      let query = client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString());

      // Apply category filter if user has favorite categories
      if (favoriteCategories.length > 0) {
        query = query.in('category_id', favoriteCategories);
      }

      const { data: recentItems, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit * 3); // Get more items to sort by relevance

      if (error || !recentItems) {
        return { data: null, error };
      }

      // Calculate similarity scores for recent items
      const itemsWithScores = await Promise.all(
        recentItems.map(async (item) => {
          if (!item.embedding) {
            return { ...item, similarity_score: 0.5, overall_score: 0.5 };
          }

          // Calculate average similarity to user's items
          let totalSimilarity = 0;
          let count = 0;

          for (const userItem of userItems) {
            if (!userItem.embedding) continue;

            const { data: simResult } = await client.rpc('match_items_cosine', {
              query_embedding: userItem.embedding,
              match_threshold: 0.1,
              match_count: 1,
              target_item_id: item.id
            });

            if (simResult && simResult.length > 0) {
              totalSimilarity += simResult[0].similarity || 0;
              count++;
            }
          }

          const avgSimilarity = count > 0 ? totalSimilarity / count : 0.5;
          
          // Boost score for more recent items
          const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
          const recencyBoost = Math.max(0, (30 - daysSinceCreated) / 30) * 0.2; // Up to 0.2 boost

          const overallScore = avgSimilarity + recencyBoost;

          return {
            ...item,
            similarity_score: avgSimilarity,
            overall_score: Math.min(1, overallScore)
          };
        })
      );

      // Sort by overall score and limit
      const sortedItems = itemsWithScores
        .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
        .slice(0, limit);

      return { data: sortedItems, error: null };
    });
  }

  /**
   * Get recently listed items (safe wrapper)
   */
  static async getRecentlyListedSafe(userId: string, limit: number = 10) {
    try {
      const result = await this.getRecentlyListed(userId, limit);
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getRecentlyListedSafe:', error);
      return {
        data: [],
        error: error
      };
    }
  }

  /**
   * Get top categories based on item count and user activity
   */
  static async getTopCategories(userId: string, limit: number = 6) {
    return RedisCache.cache(
      'top-categories',
      [userId, limit],
      () => this.authenticatedCall(async (client) => {
        // Get all categories with item counts
        const { data: categories, error: categoriesError } = await client
          .from('categories')
          .select('id, name, description')
          .order('name');

        if (categoriesError || !categories) {
          return { data: null, error: categoriesError };
        }

        // Get item counts per category (available items only)
        const categoriesWithCounts = await Promise.all(
          categories.map(async (category) => {
            const { count } = await client
              .from('items')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('status', 'available')
              .neq('user_id', userId);

            return {
              ...category,
              item_count: count || 0
            };
          })
        );

        // Sort by item count and get top categories
        const topCategories = categoriesWithCounts
          .filter(cat => cat.item_count > 0)
          .sort((a, b) => b.item_count - a.item_count)
          .slice(0, limit);

        return { data: topCategories, error: null };
      }),
      true // no TTL param; caller controls bypass if needed
    );
  }

  /**
   * Get top categories (safe wrapper)
   */
  static async getTopCategoriesSafe(userId: string, limit: number = 6) {
    try {
      const result = await this.getTopCategories(userId, limit);
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getTopCategoriesSafe:', error);
      return {
        data: [],
        error: error
      };
    }
  }

  /**
   * Get other items for vertical scrolling grid with pagination
   * 2 columns, 10 items per page
   */
  static async getOtherItems(userId: string, page: number = 1, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const offset = (page - 1) * limit;

      // Get total count first
      const { count: totalCount } = await client
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'available')
        .neq('user_id', userId);

      // Get items with pagination
      const { data, error } = await client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          items: data || [],
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit),
            hasMore: (page * limit) < (totalCount || 0)
          }
        },
        error: null
      };
    });
  }

  /**
   * Get other items (safe wrapper)
   */
  static async getOtherItemsSafe(userId: string, page: number = 1, limit: number = 10) {
    try {
      const result = await this.getOtherItems(userId, page, limit);
      return {
        data: result?.data || { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getOtherItemsSafe:', error);
      return {
        data: { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: error
      };
    }
  }

  /**
   * Get items by category ID with pagination
   */
  static async getItemsByCategory(userId: string, categoryId: string, page: number = 1, limit: number = 10) {
    return this.authenticatedCall(async (client) => {
      const offset = (page - 1) * limit;

      // Get total count first
      const { count: totalCount } = await client
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'available')
        .eq('category_id', categoryId)
        .neq('user_id', userId);

      // Get items with pagination
      const { data, error } = await client
        .from('items')
        .select('*, item_images(image_url), users!items_user_id_fkey(username, first_name, last_name)')
        .eq('status', 'available')
        .eq('category_id', categoryId)
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          items: data || [],
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit),
            hasMore: (page * limit) < (totalCount || 0)
          }
        },
        error: null
      };
    });
  }

  /**
   * Get items by category (safe wrapper)
   */
  static async getItemsByCategorySafe(userId: string, categoryId: string, page: number = 1, limit: number = 10) {
    try {
      const result = await this.getItemsByCategory(userId, categoryId, page, limit);
      return {
        data: result?.data || { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: result?.error || null
      };
    } catch (error) {
      console.error('Error in getItemsByCategorySafe:', error);
      return {
        data: { items: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } },
        error: error
      };
    }
  }

  // ==================== ADDITIONAL ITEM METHODS ====================

  /**
   * Get all categories
   */
  static async getCategories() {
    // Cached categories for performance
    return RedisCache.cache(
      'all-categories',
      ['active'],
      () => this.authenticatedCall(async (client) => {
        return await client
          .from('categories')
          .select('id, name, description, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true });
      }),
      true
    );
  }

  static async getCategoryIdToNameMap() {
    const { data } = await this.getCategories();
    const map: Record<string, string> = {};
    (data || []).forEach((c: any) => { if (c?.id) map[c.id] = c.name || String(c.id); });
    return map;
  }

  /**
   * Create item images (batch insert)
   */
  static async createItemImages(images: Array<{
    item_id: string;
    image_url: string;
    sort_order: number;
    is_primary: boolean;
  }>) {
    return this.authenticatedCall(async (client) => {
      return await client
        .from('item_images')
        .insert(images)
        .select();
    });
  }

  /**
   * Get item by ID with relations
   */
  static async getItemById(itemId: string) {
    return this.authenticatedCall(async (client) => {
      // First get the item
      const { data: item, error: itemError } = await client
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError || !item) {
        return { data: null, error: itemError };
      }

      // Then get related data separately
      let category = null;
      let user = null;
      let images: any[] = [];
      
      // Get category if category_id exists
      if (item.category_id) {
        try {
          const { data: categoryData } = await client
            .from('categories')
            .select('name')
            .eq('id', item.category_id)
            .single();
          category = categoryData;
        } catch (error) {
          console.log('Error fetching category:', error);
        }
      }

      // Get user
      try {
        const { data: userData } = await client
          .from('users')
          .select('id, username, first_name, last_name, profile_image_url')
          .eq('id', item.user_id)
          .single();
        user = userData;
      } catch (error) {
        console.log('Error fetching user:', error);
      }

      // Get images
      try {
        const { data: imagesData } = await client
          .from('item_images')
          .select('id, image_url, thumbnail_url, sort_order, is_primary')
          .eq('item_id', itemId);
        images = imagesData || [];
      } catch (error) {
        console.log('Error fetching images:', error);
      }

      return {
        data: {
          ...item,
          category,
          user,
          images,
        },
        error: null,
      };
    });
  }
}
