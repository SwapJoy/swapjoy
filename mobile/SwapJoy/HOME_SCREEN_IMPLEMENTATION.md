# Home Screen Sections Implementation

## Overview
Enhanced the Explore/Home screen with multiple sections, each with separate API endpoints for better performance and modularity.

## New Sections

### 1. **Top Matches** (Existing - Kept as is)
- **Description**: AI-powered personalized item recommendations with match scores
- **API Endpoint**: `getTopPicksForUserSafe(userId, limit)`
- **Display**: Horizontal scrolling cards
- **Features**: 
  - Match percentage badges
  - Bundle support
  - AI similarity scores

### 2. **Recently Listed** (New)
- **Description**: Items from the last month, sorted by relevance using AI
- **API Endpoint**: `getRecentlyListedSafe(userId, limit)`
- **Display**: Horizontal scrolling cards (slightly smaller than Top Matches)
- **Features**:
  - Date filtering (last 30 days)
  - AI relevance scoring with recency boost
  - Category filtering based on user preferences
  - Redis caching (5 min TTL)

### 3. **Top Categories** (New)
- **Description**: Most popular categories based on available item counts
- **API Endpoint**: `getTopCategoriesSafe(userId, limit)`
- **Display**: 3-column grid of category cards
- **Features**:
  - Item count per category
  - Sorted by popularity
  - Only shows categories with available items
  - Redis caching (10 min TTL)

### 4. **Explore More** (New)
- **Description**: Vertical scrolling grid of all other available items
- **API Endpoint**: `getOtherItemsSafe(userId, page, limit)`
- **Display**: 2-column vertical grid with pagination
- **Features**:
  - Infinite scroll pagination
  - 10 items per page
  - Pull-to-refresh support
  - Loading indicator on pagination

## API Architecture

### Separate Endpoints
Each section has its own dedicated endpoint to allow:
- **Independent caching strategies**
- **Better performance** (load sections incrementally)
- **Easier maintenance** and debugging
- **Flexible updates** without affecting other sections

### Endpoint Structure
```typescript
// Recently Listed
getRecentlyListed(userId, limit) -> Returns items from last month with AI scoring
getRecentlyListedSafe(userId, limit) -> Safe wrapper with error handling

// Top Categories
getTopCategories(userId, limit) -> Returns categories with item counts
getTopCategoriesSafe(userId, limit) -> Safe wrapper with error handling

// Other Items
getOtherItems(userId, page, limit) -> Returns paginated items
getOtherItemsSafe(userId, page, limit) -> Safe wrapper with error handling

// Bonus: Category Items
getItemsByCategory(userId, categoryId, page, limit) -> Returns items by category
getItemsByCategorySafe(...) -> Safe wrapper with error handling
```

## Custom Hooks

### useRecentlyListed
- Fetches and manages recently listed items
- Returns: `{ items, loading, error, refresh }`

### useTopCategories
- Fetches and manages top categories
- Returns: `{ categories, loading, error, refresh }`

### useOtherItems
- Fetches and manages paginated items
- Supports infinite scroll
- Returns: `{ items, pagination, loading, loadingMore, error, loadMore, refresh }`

## UI/UX Features

### Pull-to-Refresh
- Refreshes all sections simultaneously
- Unified loading state

### Infinite Scroll
- Automatically loads more items in "Explore More" section
- Loading indicator shown during pagination
- Smooth scroll experience

### Responsive Design
- Optimized for different screen sizes
- Proper spacing and margins
- Beautiful card shadows and borders

### Performance Optimizations
- Redis caching for expensive queries
- Debounced data fetching
- Component memoization
- Optimized FlatList rendering
- Proper cleanup on unmount

## Redis Caching Strategy

| Endpoint | Cache Key | TTL |
|----------|-----------|-----|
| Top Picks | `top-picks:[userId]:[limit]` | 10 min |
| Recently Listed | `recently-listed:[userId]:[limit]` | 5 min |
| Top Categories | `top-categories:[userId]:[limit]` | 10 min |
| Other Items | Not cached (frequent updates) | N/A |

## AI Features

### Recently Listed
- Calculates similarity scores with user's items
- Adds recency boost (up to 0.2)
- Sorts by overall relevance score
- Filters by user's favorite categories

### Top Picks
- Uses vector embeddings for semantic matching
- Considers price compatibility
- Location-aware (when available)
- Bundle recommendations

## Future Enhancements

1. **Category Navigation**: Implement navigation to category-specific item lists
2. **Search Integration**: Add search functionality within sections
3. **Filters**: Allow users to filter items by price, condition, location
4. **Favorites**: Let users save items to favorites
5. **Analytics**: Track which sections get the most engagement
6. **A/B Testing**: Test different section orders and layouts
7. **Personalization**: Learn from user behavior to improve recommendations

## Bug Fixes

### Infinite Re-render Issue (Fixed)
**Problem**: The hooks were causing infinite re-renders due to circular dependencies in `useEffect`.

**Root Cause**: 
- `fetchItems`, `fetchCategories`, and `fetchAIOffers` functions were included in `useEffect` dependencies
- These functions were created with `useCallback` that depended on `user`
- This caused a loop: user changes → function recreates → useEffect runs → fetches data → function recreates → ...

**Solution**:
1. Replaced `fetchTimeoutRef` with `hasFetchedRef` to track fetch status
2. Changed `useEffect` to only depend on `user?.id` instead of the entire user object or fetch function
3. Added `hasFetchedRef` check to prevent duplicate fetches
4. Updated refresh functions to reset `hasFetchedRef` before fetching

**Files Fixed**:
- `hooks/useRecentlyListed.ts`
- `hooks/useTopCategories.ts`
- `hooks/useOtherItems.ts`
- `hooks/useExploreData.ts`

## Testing

### Manual Testing Checklist
- [x] Fixed infinite re-render issue
- [ ] Top Matches section loads correctly
- [ ] Recently Listed shows items from last month
- [ ] Top Categories displays properly
- [ ] Explore More grid shows items
- [ ] Infinite scroll works smoothly
- [ ] Pull-to-refresh updates all sections
- [ ] Loading states are displayed correctly
- [ ] Empty states are handled gracefully
- [ ] Navigation to item details works
- [ ] Images load properly with fallbacks
- [ ] Redis caching reduces API calls (once per section)

## Files Modified/Created

### New Files
- `mobile/SwapJoy/hooks/useRecentlyListed.ts`
- `mobile/SwapJoy/hooks/useTopCategories.ts`
- `mobile/SwapJoy/hooks/useOtherItems.ts`

### Modified Files
- `mobile/SwapJoy/services/api.ts` - Added new API endpoints
- `mobile/SwapJoy/screens/ExploreScreen.tsx` - Updated UI with new sections
- `mobile/SwapJoy/hooks/useExploreData.ts` - Added `price` field to AIOffer interface

## Code Quality
- ✅ No linting errors
- ✅ TypeScript type safety
- ✅ Proper error handling
- ✅ Memory leak prevention
- ✅ Performance optimizations
- ✅ Clean code structure
- ✅ Comprehensive documentation

