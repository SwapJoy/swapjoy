# Root Cause Analysis: Data Not Showing in UI

## Executive Summary
Data is being fetched successfully but lost or blocked before reaching the UI due to:
1. **Blocking UI logic** that requires ALL sections to be ready
2. **Incomplete error handling** that leaves state inconsistent
3. **useFocusEffect** triggering unnecessary refreshes causing race conditions
4. **Cache bypass logic** that may be problematic after Expo ejection
5. **No error visibility** - errors are logged but never shown
6. **Independent sections blocking each other** instead of rendering independently

## Detailed Findings

### 1. UI Blocking Logic (CRITICAL)
**Location:** `ExploreScreen.tsx:224`
```typescript
if (!isInitialized || loading || !hasData) {
  return <LoadingScreen />
}
```

**Problem:** This requires ALL of:
- `isInitialized` to be true
- `loading` to be false (but `loading` is AND of all sections)
- `hasData` to be true

**Impact:** If ANY section fails or is slow, the ENTIRE UI is blocked.

**Line 58:** `const loading = topPicksLoading && recentLoading && categoriesLoading && othersLoading;`
- This requires ALL sections to be loading simultaneously
- But then line 224 blocks if `loading || !hasData`
- Contradictory logic

### 2. Incomplete Error Handling (CRITICAL)
**Location:** `useExploreData.ts:158-164`
```typescript
if (topPicksError) {
  console.error('Error fetching top picks:', topPicksError);
  if (isMountedRef.current) {
    setHasData(true);  // ✅ Sets hasData
    // ❌ Missing: setIsInitialized(true)
    // ❌ Missing: setLoading(false)
  }
  return;  // ❌ Returns early without setting loading states
}
```

**Problem:** On error, `hasData` is set but `isInitialized` and `loading` are NOT set, causing:
- UI to wait forever for `isInitialized` to become true
- `loading` state to remain true
- Line 224 blocks: `if (!isInitialized || loading || !hasData)` - ALL conditions fail

### 3. useFocusEffect Race Condition (HIGH)
**Location:** `ExploreScreen.tsx:48-55`
```typescript
useFocusEffect(
  useCallback(() => {
    console.log('[ExploreScreen] focused - refreshing all sections');
    refreshTopPicks();      // ❌ Calls refresh which resets hasFetchedRef
    refreshRecent();        // ❌ Calls refresh which resets hasFetchedRef
    refreshCategories();    // ❌ Calls refresh which resets hasFetchedRef
    refreshOthers();       // ❌ Calls refresh which resets hasFetchedRef
  }, [...])
);
```

**Problem:** 
- Every time screen comes into focus, ALL sections refresh
- `refresh()` functions reset `hasFetchedRef.current = false`
- This causes re-fetch even if data was already loaded
- Race conditions: multiple refreshes happening simultaneously
- State resets: `isInitialized`, `hasData` may be reset during refresh

### 4. Cache Bypass Logic (MEDIUM)
**Location:** `api.ts:1088`
```typescript
const result = await this.getTopPicksForUser(userId, limit, { 
  bypassCache: options?.bypassCache ?? true  // ❌ Always bypasses cache by default
});
```

**Problem:**
- Default is to bypass cache (`?? true`)
- After Expo ejection, if Redis Edge Functions are slow/failing, it still tries to use them
- `redisCache.ts:6` - 1.5 second timeout might be too short
- No fallback when cache fails

### 5. No Error Visibility (HIGH)
**Location:** Multiple hooks

**Problem:**
- Errors are `console.error()` but never displayed to user
- User has no idea why data isn't showing
- No error UI components
- No retry mechanisms visible to user

### 6. Independent Sections Not Independent (CRITICAL)
**Location:** `ExploreScreen.tsx:224`

**Problem:**
- Top Picks, Recent Items, Categories, Other Items are fetched independently
- But UI blocks until ALL are ready
- Should render each section independently with skeleton loaders

### 7. Token Refresh Issues (MEDIUM)
**Location:** `api.ts:103-112`
```typescript
if (isAuthError) {
  try {
    await AuthService.getCurrentSession();
    await this.getAuthenticatedClient();
    result = await apiCall(client);  // ❌ Retries but doesn't handle failure
  } catch (_) {
    // ❌ Falls through silently
  }
}
```

**Problem:**
- Token refresh retry fails silently
- No error propagated to user
- Data might be fetched but lost during refresh

### 8. Data Loss Points

**Point 1: Error in fetchAIOffers (useExploreData.ts:158)**
- Error occurs → sets `hasData=true` but returns early
- `isInitialized` never set → UI blocks forever
- Data is lost because state is inconsistent

**Point 2: useFocusEffect refresh (ExploreScreen.tsx:48)**
- Screen comes into focus → triggers refresh
- Refresh resets `hasFetchedRef = false`
- During refresh, `isInitialized` might be reset
- If refresh fails, data is lost

**Point 3: Token refresh during API call (api.ts:103)**
- Token expires during API call
- Refresh happens, but if it fails, error is swallowed
- Data is lost

**Point 4: Redis cache timeout (redisCache.ts:32)**
- Cache times out after 1.5 seconds
- Returns `null` but doesn't indicate timeout to user
- Data might be available but cache slow

## Questions Answered

### Q1: If data is coming properly, when does it get lost?
**A:** Data is lost at these points:
1. **Error in fetchAIOffers** - Sets `hasData=true` but returns early without setting `isInitialized=true`, causing UI to block
2. **useFocusEffect refresh** - Resets state during refresh, causing race conditions
3. **Token refresh failure** - Errors are swallowed silently
4. **State inconsistency** - `hasData=true` but `isInitialized=false` blocks UI

### Q2: Top picks should be independent from others
**A:** Currently they're NOT independent:
- UI blocks until ALL sections ready (`loading = topPicksLoading && recentLoading && ...`)
- Should render each section independently with skeleton loaders

### Q3: If there's an error, why don't I see it?
**A:** Errors are only `console.error()` - never displayed to user. No error UI components exist.

### Q4: Data comes but gets lost before reaching UI?
**A:** Yes! Data is fetched successfully but:
1. State is set inconsistently (`hasData=true` but `isInitialized=false`)
2. UI blocking logic prevents display
3. useFocusEffect causes state resets

### Q5: Redis cache issue after Expo ejection?
**A:** Potentially:
- 1.5 second timeout might be too short
- Edge Functions might be slow after ejection
- No fallback when cache fails
- Cache is bypassed by default anyway

### Q6: Token refresh issues?
**A:** Yes:
- Token refresh retry fails silently
- No error propagated
- State might be inconsistent during refresh

### Q7: Other sections also don't show data?
**A:** Same root causes:
- All sections blocked by same UI logic
- Independent sections not rendering independently
- Same error handling issues

## Recommended Fixes

1. **Fix UI blocking logic** - Make sections independent
2. **Fix error handling** - Set all state consistently
3. **Add error visibility** - Show errors to user
4. **Fix useFocusEffect** - Only refresh if needed
5. **Add skeleton loaders** - Show loading per section
6. **Improve token refresh** - Handle failures properly
7. **Add retry mechanisms** - User-visible retry buttons

