# `getTopPicksForUser` Function Documentation

## Overview

`getTopPicksForUser` is a recommendation engine that generates personalized item recommendations for a user based on category preferences, price matching, and location proximity. The function uses weighted scoring algorithms and intelligent filtering to deliver relevant swap suggestions.

**Key Features**:
- Category preference filtering (favorite categories)
- Price compatibility scoring (based on user's average item value)
- Location-aware filtering
- Single recommendation source: favorite category items

**Location**: `mobile/SwapJoy/services/api.ts`  
**Class**: `ApiService`  
**Type**: Static async method

---

## Function Signature

```typescript
static async getTopPicksForUser(
  userId: string,
  limit: number = 10,
  options?: { bypassCache?: boolean }
): Promise<{ data: any[] | null; error: any | null }>
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `userId` | `string` | Yes | - | UUID of the user for whom to generate recommendations |
| `limit` | `number` | No | `10` | Maximum number of recommendations to return |
| `options` | `{ bypassCache?: boolean }` | No | `{}` | Options object:<br>- `bypassCache`: If `true`, skips Redis cache and fetches fresh data |

### Return Value

Returns a Promise resolving to:
```typescript
{
  data: Item[] | null,  // Array of recommended items with full details
  error: Error | null    // Error object if operation failed, null otherwise
}
```

Each item in the `data` array includes:
- Full item details (title, description, price, currency, etc.)
- Category information
- Item images
- Owner/user information
- Scoring metadata:
  - `similarity_score`: Semantic similarity (0-1)
  - `category_match_score`: Category preference match (0-1)
  - `price_match_score`: Price compatibility (0-1)
  - `location_match_score`: Location proximity (0-1)
  - `overall_score`: Weighted composite score (0-1)
  - `from_favorite_category`: Boolean flag
  - `is_favorite_category`: Boolean flag

---

## Algorithm Flow

The function follows a multi-stage recommendation pipeline:

### Stage 1: Data Collection (Parallel Execution)

Fetches initial data in parallel using `Promise.all()`:

1. **User Preferences**
   - Favorite categories
   - Manual location (lat/lng)
   - Preferred search radius (km)

2. **User Items**
   - All available items owned by the user
   - Must have embeddings (vector representations)
   - Used only for calculating average item value for price scoring
   - **Note**: Items are NOT used for similarity matching

3. **Exchange Rates**
   - Currency conversion rates
   - Used to normalize prices to GEL (Georgian Lari) for comparison

4. **Recommendation Weights**
   - User-specific scoring weights:
     - `similarity_weight`: Importance of semantic similarity (0-1)
     - `category_score`: Importance of category matching (0-1)
     - `price_score`: Importance of price matching (0-1)
     - `location_lat` / `location_lng`: Importance of location (0-1)

### Stage 2: Price Calculation

Calculates the average value of user's items in GEL for price compatibility scoring:
- Fetches user's available items (with embeddings)
- Converts each item's price to GEL using exchange rates
- Sums total value
- Calculates average: `totalValueGEL / itemCount`
- Used for price match scoring in recommendations

**Note**: User items are fetched only for price calculation, not for similarity matching.

### Stage 3: Recommendation Sources

Collects recommendations from one source:

#### 3.1 Favorite Category Items

**Purpose**: Ensure items from favorite categories appear even if similarity is low

**Process**:
1. Only executes if:
   - User has favorite categories
   - `category_score < 0.99` (not in strict mode)
2. Fetches items directly from favorite categories
   - Status: available
   - Excludes user's own items
   - Limit: `limit * 2`
3. **Batch fetches user locations** (fixes N+1 problem):
   - Collects all unique user IDs from items
   - Single query to fetch all locations
   - Creates location map for O(1) lookup
4. Scores each item:
   - Similarity: Fixed at 0.7 (baseline)
   - Category: 1.0 (perfect match)
   - Price: Based on average user item value
   - Location: Calculated from distance
   - Overall: Weighted combination


### Stage 4: Deduplication and Filtering

1. **Strict Category Filter** (if `category_score >= 0.99`):
   - Removes any items not in favorite categories
   - Ensures 100% category compliance

2. **Deduplication**:
   - Uses `deduplicateAndSort()` helper
   - Removes duplicate items by ID
   - Keeps item with highest `overall_score`
   - Prioritizes favorite category items in ties
   - Sorts by `overall_score` (descending)

### Stage 5: Final Data Enrichment

1. **Extracts item IDs** from deduplicated recommendations

2. **Single optimized query** with joins:
   - Fetches items with:
     - Full item data
     - Category information (joined)
     - Item images (nested)
     - Owner/user information (joined)
   - Replaces 3 separate queries with 1 joined query

3. **Combines data**:
   - Maps similarity scores from previous stage
   - Attaches images and user data
   - Determines favorite category flags

4. **Applies strict category filter** again (safety check)

### Stage 6: Final Sorting and Filtering

1. **Sorts by overall score** (descending)

2. **Applies location radius filter**:
   - Uses `applyLocationRadiusFilter()` helper
   - Calls `filter_items_by_radius` RPC function
   - Removes items outside user's preferred radius
   - Adds distance information to items

3. **Limits results** to `limit` items

### Stage 7: Fallback Handling

If no recommendations found:
- Calls `getFallbackRecommendations()`
- Returns recently listed items:
  - From favorite categories (if available)
  - Or all available items
  - Sorted by creation date (newest first)
  - Filtered by location radius

---

## Scoring Mechanism

### Score Components

Each recommendation receives four component scores (0-1 range):

1. **Similarity Score** (`similarity_score`)
   - Fixed baseline score for favorite category items (0.7)
   - Not used for semantic matching (no vector embeddings)
   - Range: 0-1

2. **Category Match Score** (`category_match_score`)
   - 1.0 if item is in user's favorite categories
   - 0.5 if no category preference or item has no category
   - 0.0 if item is in a non-favorite category

3. **Price Match Score** (`price_match_score`)
   - Based on price compatibility with user's average item value
   - Uses 30% tolerance by default
   - Higher score for prices closer to user's average
   - Returns 0.5 if user has no items or no price data

4. **Location Match Score** (`location_match_score`)
   - Based on distance from user's location
   - Uses Haversine formula for distance calculation
   - Score decreases linearly with distance
   - 1.0 at user's location, 0.0+ at max radius
   - Returns 0.5 if location data missing

### Weighted Overall Score

The final `overall_score` is calculated using:

```typescript
overall_score = (
  similarity_score * similarity_weight +
  category_match_score * category_score +
  price_match_score * price_score +
  location_match_score * avg_location_weight
) / total_weight
```

Where:
- `avg_location_weight = (location_lat + location_lng) / 2`
- `total_weight = similarity_weight + category_score + price_score + avg_location_weight`

The score is normalized to 0-1 range.

**Note**: For favorite category items, `similarity_score` is fixed at 0.7 as a baseline value since semantic matching is not performed.

---

## Caching Strategy

### Redis Cache

The function implements a two-tier caching strategy:

1. **Cache Key**: `topPicks:{userId}:{limit}`
2. **Cache Check**: Before executing `fetchFn()`
3. **Cache Store**: After successful `fetchFn()` execution
4. **Cache Bypass**: If `options.bypassCache === true`

### Cache Invalidation

Cache is invalidated when:
- User updates manual location (`updateManualLocation`)
- Pattern: `top-picks:{userId}:*`

---

## Error Handling

### Error Types

1. **Network Errors**
   - Detected by checking error message for "Network request failed", "network", or "fetch"
   - Returns error code: `NETWORK_ERROR`
   - User-friendly message: "Network request failed. Please check your internet connection."

2. **Query Errors**
   - Database query failures
   - RPC function errors
   - Returns error code: `QUERY_ERROR`
   - Includes original error message

3. **Fallback Errors**
   - If both main query and fallback fail
   - Returns combined error with both error messages

### Error Recovery

1. **Primary Recovery**: Falls back to `getFallbackRecommendations()`
   - Returns recently listed items
   - Ensures user always gets some results

2. **Secondary Recovery**: If fallback also fails
   - Returns empty array with error details
   - Prevents app crash

---

## Performance Optimizations

### Query Optimization

1. **Parallel Initial Queries**
   - User data, user items, exchange rates, and weights fetched in parallel
   - Reduces latency from sequential queries

2. **Batch Location Fetching**
   - Favorite category items: Batch fetch all user locations
   - Fixes N+1 query problem
   - Single query instead of N queries

3. **Single Join Query**
   - Final item details: Single query with joins
   - Replaces 3 separate queries (items, images, users)
   - Reduces database round trips

4. **Location Filtering**
   - Applied once at the end
   - Uses efficient RPC function `filter_items_by_radius`
   - Avoids redundant filtering

### Code Organization

1. **Helper Functions**
   - `getFavoriteCategoryItems()`: Handles favorite category logic
   - `getWeightedMatchesFromUserItems()`: Handles weighted matching
   - `fetchItemDetailsWithJoins()`: Handles final data enrichment
   - Improves readability and maintainability

2. **Early Returns**
   - Returns empty arrays for edge cases
   - Avoids unnecessary processing

---

## Helper Functions

### `getFavoriteCategoryItems()`

Fetches and scores items from user's favorite categories.

**Key Features**:
- Batch fetches user locations (fixes N+1)
- Applies weighted scoring
- Returns scored items with metadata


### `fetchItemDetailsWithJoins()`

Fetches full item details with all related data in a single query.

**Key Features**:
- Single query with joins
- Includes categories, images, and users
- Applies strict category filtering if needed

### `deduplicateAndSort()`

Removes duplicate items and sorts by score.

**Key Features**:
- Keeps highest scoring duplicate
- Prioritizes favorite category items
- Sorts by overall score

### `applyLocationRadiusFilter()`

Filters items by location radius using RPC function.

**Key Features**:
- Uses `filter_items_by_radius` RPC
- Adds distance information
- Handles missing location data gracefully

---

## Usage Examples

### Basic Usage

```typescript
const result = await ApiService.getTopPicksForUser(userId, 10);
if (result.error) {
  console.error('Error:', result.error);
} else {
  console.log('Recommendations:', result.data);
}
```

### With Cache Bypass

```typescript
const result = await ApiService.getTopPicksForUser(userId, 20, {
  bypassCache: true
});
```

### Accessing Scores

```typescript
const result = await ApiService.getTopPicksForUser(userId, 10);
result.data?.forEach(item => {
  console.log(`${item.title}:`);
  console.log(`  Overall Score: ${item.overall_score}`);
  console.log(`  Similarity: ${item.similarity_score}`);
  console.log(`  Category Match: ${item.category_match_score}`);
  console.log(`  Price Match: ${item.price_match_score}`);
  console.log(`  Location Match: ${item.location_match_score}`);
  console.log(`  From Favorite Category: ${item.from_favorite_category}`);
});
```

---

## Database Dependencies

### Required Tables

- `users`: User preferences and location
- `items`: Item data
- `categories`: Category information
- `item_images`: Item images
- `currencies`: Exchange rates

### Required RPC Functions

- `filter_items_by_radius`: Location-based filtering

### Required Indexes

- Items: `user_id`, `status`, `category_id`
- Users: `id`, `manual_location_lat`, `manual_location_lng`

**Note**: Vector embeddings are no longer required for recommendations.

---

## Performance Characteristics

### Time Complexity

- Initial queries: O(1) - Parallel execution
- Favorite category items: O(n) - Linear processing
- Deduplication: O(n) - Map-based
- Final query: O(1) - Single query with joins

### Space Complexity

- O(n) where n is the number of recommendations
- Temporary storage for intermediate results

### Typical Execution Time

- With cache: < 50ms
- Without cache: 100-300ms (depending on data volume)
- Fallback: 100-300ms

**Performance Improvement**: Removed prompt-based and user-item matching reduces execution time significantly.

---

## Limitations and Considerations

1. **Price Calculation Dependency**
   - User items are fetched for price calculation only
   - If user has no items, price matching defaults to 0.5 (neutral score)
   - Items without price/currency data are excluded from price calculation

2. **Favorite Categories Requirement**
   - Recommendations are primarily based on favorite categories
   - If user has no favorite categories and `category_score >= 0.99`, no recommendations will be returned
   - Falls back to recently listed items if no category-based matches found

3. **Location Dependency**
   - Location filtering requires user location data
   - Falls back gracefully if location missing

4. **Category Strictness**
   - When `category_score >= 0.99`, only favorite categories shown
   - May result in fewer recommendations

5. **Price Filtering**
   - Only applies when `price_score >= 0.2`
   - Very low price weights disable price filtering

6. **Cache Dependency**
   - Requires Redis for optimal performance
   - Falls back to direct queries if cache unavailable

---

## Future Improvements

1. **Semantic Matching**
   - Re-introduce vector-based semantic matching
   - Profile-based or item-based similarity scoring

2. **Real-time Updates**
   - WebSocket-based cache invalidation
   - Push notifications for new matches

3. **Advanced Filtering**
   - Condition-based filtering
   - Brand preferences
   - Item age preferences

4. **Performance Monitoring**
   - Query performance metrics
   - Cache hit rate tracking
   - Recommendation quality metrics

---

## Related Documentation

- [Recommendation Weights Configuration](../types/recommendation.ts)
- [Location-Aware Matching](../data-models/LOCATION_AWARE_MATCHING.md)
- [Database Schema](../data-models/database-schema.md)
- [API Endpoints](./api-endpoints.md)

---

## Version History

- **v2.2** (Current): Removed prompt-based recommendations; recommendations now based solely on favorite category items
- **v2.1**: Removed user-item matching; recommendations based on user profile embedding and favorite categories
- **v2.0**: Optimized with helper functions, batch queries, and single join query
- **v1.0**: Initial implementation with sequential queries

---

## Author Notes

This function is a critical component of SwapJoy's recommendation system. It balances multiple factors to provide personalized, relevant swap suggestions while maintaining good performance through caching and query optimization.

For questions or issues, refer to the code comments or contact the development team.

