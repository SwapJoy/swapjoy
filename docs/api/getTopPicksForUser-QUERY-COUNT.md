# Database Query Count Analysis for `getTopPicksForUser`

## Total Query Count

**Minimum (Happy Path with Cache)**: 0 queries (cached result)

**Minimum (Happy Path without Cache)**: **6-8 queries**

**Maximum (With Fallback)**: **10-12 queries**

**With Prompt-Based Recommendations**: **+2 queries** (if enabled)

---

## Query Breakdown

### Stage 1: Initial Data Collection (Parallel - 4 queries)

Executed in parallel via `Promise.all()`:

1. **Users Table** - Get user preferences
   ```typescript
   client.from('users')
     .select('favorite_categories, manual_location_lat, manual_location_lng, preferred_radius_km')
     .eq('id', userId)
     .maybeSingle()
   ```

2. **Items Table** - Get user items (for price calculation)
   ```typescript
   client.from('items')
     .select('id, embedding, price, currency, title, description, category_id')
     .eq('user_id', userId)
     .eq('status', 'available')
     .not('embedding', 'is', null)
   ```

3. **Currencies Table** - Get exchange rates
   ```typescript
   client.from('currencies')
     .select('code, rate')
   ```

4. **getRecommendationWeights()** - Get recommendation weights
   - Returns cached/default weights (no query if cached)
   - **Note**: This is not a database query, it's a method call

**Subtotal: 3 database queries** (weights are not a query)

---

### Stage 2: Prompt-Based Recommendations (Optional - 2-3 queries)

**Only executed if prompt RPC succeeds:**

5. **RPC Call** - `match_items_to_user_prompt`
   ```typescript
   client.rpc('match_items_to_user_prompt', {
     p_user_id: userId,
     p_match_count: Math.max(limit * 4, 40),
     p_exclude_user: userId
   })
   ```

6. **Items Table with Joins** - Get prompt items with full details
   ```typescript
   client.from('items')
     .select('*, category:categories!items_category_id_fkey(...), item_images(image_url), users!items_user_id_fkey(...)')
     .in('id', topIds)
   ```

7. **RPC Call** - `filter_items_by_radius` (location filtering)
   ```typescript
   client.rpc('filter_items_by_radius', {
     p_lat: userLat,
     p_lng: userLng,
     p_radius_km: maxRadiusKm,
     p_item_ids: itemIds
   })
   ```

**Subtotal: +3 queries** (if prompt recommendations are used)

---

### Stage 3: Favorite Category Items (2 queries)

**Only executed if `category_score < 0.99` and user has favorite categories:**

8. **Items Table** - Get favorite category items
   ```typescript
   client.from('items')
     .select('id, title, description, price, currency, category_id, embedding, user_id, category:categories!items_category_id_fkey(...)')
     .in('category_id', favoriteCategories)
     .eq('status', 'available')
     .neq('user_id', userId)
     .limit(limit * 2)
   ```

9. **Users Table** - Batch fetch user locations (fixes N+1 problem)
   ```typescript
   client.from('users')
     .select('id, manual_location_lat, manual_location_lng')
     .in('id', userIds)
   ```

**Subtotal: +2 queries** (if favorite categories exist and category_score < 0.99)

---

### Stage 4: Final Data Enrichment (1 query)

10. **Items Table with Joins** - Get final item details
    ```typescript
    client.from('items')
      .select('*, category:categories!items_category_id_fkey(...), item_images(image_url), users!items_user_id_fkey(...)')
      .in('id', itemIds)
    ```

**Subtotal: +1 query**

---

### Stage 5: Location Filtering (1 query)

11. **RPC Call** - `filter_items_by_radius` (final location filter)
    ```typescript
    client.rpc('filter_items_by_radius', {
      p_lat: userLat,
      p_lng: userLng,
      p_radius_km: maxRadiusKm,
      p_item_ids: itemIds
    })
    ```

**Subtotal: +1 query**

---

### Stage 6: Fallback (If No Results - 2-3 queries)

**Only executed if no recommendations found:**

12. **Users Table** - Get user for fallback (might be duplicate)
    ```typescript
    client.from('users')
      .select('favorite_categories, manual_location_lat, manual_location_lng, preferred_radius_km')
      .eq('id', userId)
      .maybeSingle()
    ```

13. **Items Table** - Get fallback items
    ```typescript
    client.from('items')
      .select('*, category:categories!items_category_id_fkey(...), item_images(image_url), users!items_user_id_fkey(...)')
      .eq('status', 'available')
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    ```

14. **RPC Call** - `filter_items_by_radius` (fallback location filter)
    ```typescript
    client.rpc('filter_items_by_radius', {...})
    ```

**Subtotal: +3 queries** (if fallback is triggered)

---

## Query Count Summary

### Scenario 1: Happy Path (No Prompt, No Fallback)
- Initial: 3 queries (parallel)
- Favorite categories: 2 queries
- Final enrichment: 1 query
- Location filter: 1 query
- **Total: 7 queries**

### Scenario 2: Happy Path with Prompt Recommendations
- Initial: 3 queries (parallel)
- Prompt: 3 queries (RPC + items + location filter)
- Favorite categories: 2 queries
- Final enrichment: 1 query
- Location filter: 1 query
- **Total: 10 queries**

### Scenario 3: With Fallback (No Prompt)
- Initial: 3 queries (parallel)
- Favorite categories: 2 queries
- Final enrichment: 1 query
- Location filter: 1 query
- Fallback: 3 queries
- **Total: 10 queries**

### Scenario 4: With Prompt + Fallback
- Initial: 3 queries (parallel)
- Prompt: 3 queries
- Favorite categories: 2 queries
- Final enrichment: 1 query
- Location filter: 1 query
- Fallback: 3 queries
- **Total: 13 queries**

### Scenario 5: Strict Category Mode (category_score >= 0.99)
- Initial: 3 queries (parallel)
- ~~Favorite categories: 0 queries~~ (skipped)
- Final enrichment: 1 query
- Location filter: 1 query
- **Total: 5 queries** (if no fallback)

---

## Query Optimization Opportunities

### Current Optimizations ✅

1. **Parallel Initial Queries**: 3 queries executed in parallel (reduces latency)
2. **Batch Location Fetching**: Single query for all user locations (fixes N+1)
3. **Single Join Query**: Final enrichment uses joins instead of 3 separate queries
4. **Redis Caching**: Entire result cached, avoiding all queries on cache hit

### Potential Further Optimizations

1. **Combine Favorite Category Query with Final Enrichment**
   - Currently: Favorite category items fetched, then final items fetched again
   - Could: Fetch favorite category items with full details in one query
   - **Savings: -1 query**

2. **Skip Location Filter if Already Filtered**
   - Prompt items are location-filtered, then filtered again at the end
   - Could: Skip final location filter if items already filtered
   - **Savings: -1 query** (in prompt path)

3. **Cache User Items**
   - User items are fetched every time (only for price calculation)
   - Could: Cache user items with TTL
   - **Savings: -1 query** (on cache hit)

4. **Combine Fallback User Query**
   - Fallback fetches user again (might already be in cache/memory)
   - Could: Reuse user data from Stage 1
   - **Savings: -1 query** (in fallback path)

---

## RPC Calls vs Regular Queries

**RPC Calls** (PostgreSQL functions):
- `match_items_to_user_prompt` - Vector similarity search
- `filter_items_by_radius` - Location-based filtering

**Regular Queries** (Supabase queries):
- All `client.from('table').select(...)` calls

Both count as database queries, but RPC calls may be more expensive.

---

## Performance Impact

### Query Latency (Estimated)

- **Regular queries**: 10-50ms each
- **RPC calls**: 20-100ms each (more complex)
- **Parallel queries**: Max of slowest query (10-50ms for 3 parallel)

### Total Latency (No Cache)

- **Minimum (5 queries)**: ~50-150ms
- **Typical (7 queries)**: ~70-200ms
- **Maximum (13 queries)**: ~130-400ms

### With Cache

- **Cache hit**: ~0-5ms (Redis lookup)
- **Cache miss**: Same as no cache + cache write (~5ms)

---

## Recommendations

1. **Remove Prompt-Based Recommendations** (if not used)
   - Saves 3 queries
   - Reduces complexity

2. **Combine Favorite Category + Final Enrichment**
   - Fetch favorite category items with full details immediately
   - Saves 1 query

3. **Cache User Items**
   - User items rarely change
   - Cache with 5-minute TTL
   - Saves 1 query per request

4. **Optimize Location Filtering**
   - Apply location filter once at the end
   - Skip if already filtered in prompt path
   - Saves 1 query (in prompt path)

**Potential Total Reduction**: 5-6 queries → **2-3 queries** (happy path)



