# Token Refresh Fix Summary

## Problem
Users were being signed out after ~1 hour of inactivity due to `"refresh_token_already_used"` errors when multiple refresh attempts used the same refresh token.

## Root Cause
The refresh token was being read from storage **before** the gate check, then passed as a parameter to `refreshSessionWithGate()`. This meant:
- Multiple calls could read the same token before any refresh completed
- The token was captured in a closure, so even if a refresh completed and stored a new token, waiting calls would still use the old (now invalid) token
- With refresh token rotation enabled, once a token is used, it's immediately invalid

## Solution Implemented

### 1. Modified `refreshSessionWithGate()` (auth.ts:226)
- **Removed** `refreshToken` parameter
- **Reads refresh token INSIDE the refresh function** (after gate check)
- This ensures waiting calls read the NEW token after an in-progress refresh completes

### 2. Updated All Call Sites
- Line 181: `getStoredSession()` - removed token parameter
- Line 187: `getStoredSession()` - removed token parameter  
- Line 726: `getCurrentSession()` - removed token parameter

### 3. Enhanced Error Handling
- Added specific handling for `"refresh_token_already_used"` error
- If this error occurs, checks if another refresh succeeded and returns the new session
- Improved error propagation in `refreshSession()` to throw errors with proper codes
- Network errors are handled gracefully (keep existing session)

## Key Changes

### Before:
```typescript
// Token read BEFORE gate check
const token = session.refresh_token;
await refreshSessionWithGate(token); // Token captured in closure
```

### After:
```typescript
// No token parameter - reads INSIDE refresh function
await refreshSessionWithGate(); // Reads token after gate check
```

## Benefits
1. **Eliminates race condition**: Token is read after gate check, ensuring waiting calls get the new token
2. **Prevents "already used" errors**: Only one refresh executes, and waiting calls use the new token
3. **Better error recovery**: Handles edge cases where token might be used by another refresh
4. **Maintains session**: Network errors don't clear the session

## Testing Recommendations
1. Test after 1+ hour of inactivity - should refresh successfully
2. Test with multiple simultaneous API calls - should not cause sign out
3. Test with network interruptions - should maintain session
4. Monitor logs for "refresh_token_already_used" errors - should be rare/absent

## Files Modified
- `mobile/SwapJoy/services/auth.ts`:
  - `refreshSessionWithGate()` method (lines 222-303)
  - `refreshSession()` method (lines 298-360)
  - `getStoredSession()` method (lines 181, 187)
  - `getCurrentSession()` method (line 726)

