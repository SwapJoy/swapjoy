# Token Refresh Root Cause Analysis

## Problem Summary
The app signs users out after a couple hours of inactivity. The refresh token fails with error: `"refresh_token_already_used"` - "Invalid Refresh Token: Already Used".

## Key Configuration
- **Refresh Token Rotation**: `enable_refresh_token_rotation = true` (in `mobile/SwapJoy/supabase/config.toml:131`)
- **Reuse Interval**: `refresh_token_reuse_interval = 10` seconds
- **Auto Refresh Disabled**: `autoRefreshToken: false` (in `lib/supabase.ts:202`)

## Critical Finding: Refresh Token Rotation Behavior
When `enable_refresh_token_rotation = true`, Supabase **invalidates the old refresh token immediately after it's used**. This means:
- Each refresh token can only be used **ONCE**
- After a successful refresh, the old refresh token becomes invalid
- The new refresh token from the response must be used for the next refresh

## Root Cause Analysis

### The Race Condition

Looking at the logs:
```
966| LOG  [RefreshGateKeeper] Acquiring lock and starting refresh - closing gate
967| LOG  [RefreshGateKeeper] Lock acquired, promise created
971| LOG  [RefreshGateKeeper] Refresh already in progress, waiting for existing refresh...
972| ERROR  [Supabase] Fetch error: {"code":"refresh_token_already_used",...}
```

**Two refresh attempts are happening simultaneously**, despite the gate mechanism.

### The Problem Flow

1. **Token Expires** (after ~1 hour of inactivity)
2. **Multiple API Calls Trigger Refresh**:
   - Call A: `getCurrentSession()` → detects expired → calls `refreshSessionWithGate(tokenX)`
   - Call B: `getCurrentSession()` → detects expired → calls `refreshSessionWithGate(tokenX)`
   - Both read the **same refresh token X** from storage

3. **Gate Mechanism Issue**:
   - Call A: Starts refresh, acquires gate lock
   - Call B: Should wait, but there's a **timing window** where:
     - Call B has already captured `tokenX` before Call A's refresh completes
     - Call B's refresh function is queued but hasn't executed yet
     - When Call A completes, it stores new `tokenY`
     - But Call B's refresh function still has the old `tokenX` in its closure

4. **The Critical Bug**:
   Looking at `refreshSessionWithGate()` in `auth.ts:223-241`:
   ```typescript
   private static async refreshSessionWithGate(refreshToken: string): Promise<AuthSession | null> {
     const refreshPromise = this.refreshGate.startRefresh(async () => {
       const session = await this.refreshSession(refreshToken); // ❌ Uses captured token
     });
     await refreshPromise;
     // ...
   }
   ```
   
   **The refresh token is captured in the closure BEFORE the gate check happens!**
   
   When `startRefresh()` is called:
   - If a refresh is already in progress, it returns the existing promise
   - BUT the refresh function with the captured token is still created
   - If the existing refresh completes and stores a new token, the waiting refresh function still uses the OLD token

### The Actual Sequence (Based on Logs)

1. **T0**: Call A reads `tokenX`, calls `refreshSessionWithGate(tokenX)`
   - Gate check: no refresh in progress → starts refresh
   - Creates promise with refresh function using `tokenX`

2. **T1**: Call B reads `tokenX` (before A updates), calls `refreshSessionWithGate(tokenX)`
   - Gate check: refresh in progress → returns existing promise
   - BUT: The refresh function in Call A's promise uses `tokenX`

3. **T2**: Call A's refresh completes successfully
   - Stores new `tokenY` in SecureStore
   - Resolves promise
   - Clears gate

4. **T3**: Call B's promise resolves (it was waiting for Call A)
   - Call B tries to read session from storage
   - But if Call B had its own refresh queued, it might still try to use `tokenX`

Wait, that's not quite right. Let me re-analyze...

### The Real Issue: Token Captured Before Gate Check

The critical bug is in `refreshSessionWithGate()`:

```typescript
private static async refreshSessionWithGate(refreshToken: string): Promise<AuthSession | null> {
  const refreshPromise = this.refreshGate.startRefresh(async () => {
    const session = await this.refreshSession(refreshToken); // ❌ Token captured in closure
  });
  await refreshPromise;
}
```

**The Problem Flow**:

1. **Call A** (from `getStoredSession` line 181):
   - Reads `finalSession.refresh_token` = `tokenX`
   - Calls `refreshSessionWithGate(tokenX)`
   - `startRefresh()` checks: no refresh in progress → creates new promise
   - Refresh function captures `tokenX` in closure
   - Starts executing refresh with `tokenX`

2. **Call B** (from another `getStoredSession` call):
   - Also reads `finalSession.refresh_token` = `tokenX` (before Call A updates storage)
   - Calls `refreshSessionWithGate(tokenX)`
   - `startRefresh()` checks: refresh in progress → returns Call A's promise
   - **BUT**: If Call B's refresh function was already created (edge case), it also has `tokenX`

3. **The Critical Moment**:
   - Call A's refresh completes → stores new `tokenY` → resolves promise
   - Call B's promise resolves (it was waiting for Call A)
   - **BUT**: If there's any code path that executes Call B's refresh function after Call A completes, it will use the old `tokenX` which is now invalid

**Actually, the real issue is simpler**:

Looking at the logs more carefully:
- Line 966: "Acquiring lock and starting refresh" - First refresh starts
- Line 971: "Refresh already in progress, waiting" - Second refresh detects first one

But then line 972 shows the error. This means:
- The first refresh might have failed or completed
- The second refresh tried to use the same token
- But the token was already used by the first refresh (rotation enabled)

**The Actual Bug**: The refresh token is read from storage BEFORE checking if a refresh is in progress. If two calls both read the same token, and both determine they need to refresh, they'll both try to use the same token.

### Additional Issue: Supabase Client's setSession

In `api.ts:60-63`, when setting session on Supabase client:
```typescript
await supabase.auth.setSession({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
});
```

**If `setSession()` is called with an expired access token**, Supabase might automatically attempt a refresh internally, even though `autoRefreshToken: false`. This could cause another refresh attempt with the same token.

## Root Cause Summary

### Primary Root Cause: Token Read Before Gate Check

**The Critical Bug**: In `getStoredSession()` (lines 150-191), the refresh token is read from storage BEFORE the final gate check:

```typescript
// Line 165: Read session (contains refresh token)
const finalSessionData = await SecureStore.getItemAsync(SESSION_KEY);
const finalSession = JSON.parse(finalSessionData) as AuthSession;

// Line 181: Use the token that was read
const refreshedSession = await this.refreshSessionWithGate(finalSession.refresh_token);
```

**The Race Condition Sequence**:

1. **T0**: Call A (from API request) detects expired token
   - Waits at gate (line 161) - no refresh in progress
   - Reads `finalSession.refresh_token` = `tokenX` (line 167)
   - Calls `refreshSessionWithGate(tokenX)` (line 181)
   - `startRefresh()`: no refresh in progress → creates new promise → starts refresh with `tokenX`

2. **T1**: Call B (from another API request) also detects expired token
   - Waits at gate (line 161) - Call A's refresh just started, but Call B's wait completes
   - Reads `finalSession.refresh_token` = `tokenX` (line 167) - **Same token, Call A hasn't updated yet**
   - Calls `refreshSessionWithGate(tokenX)` (line 181)
   - `startRefresh()`: refresh in progress → returns Call A's promise
   - **BUT**: The refresh function passed to `startRefresh()` captures `tokenX` in its closure

3. **T2**: Call A's refresh completes
   - Supabase invalidates `tokenX` (rotation enabled)
   - Stores new `tokenY` in SecureStore
   - Resolves promise
   - Clears gate

4. **T3**: If Call B's refresh function somehow executes (edge case), or if there's a third call:
   - Tries to use `tokenX` which is now invalid
   - Gets "refresh_token_already_used" error

### Secondary Issue: Multiple Entry Points

Multiple code paths can trigger refresh:
- `getStoredSession()` when token expires (primary path)
- `getAuthenticatedClient()` when setting session on Supabase client
- API error handlers when detecting auth errors (line 159-201 in `api.ts`)

### Tertiary Issue: Refresh Token Rotation

With `enable_refresh_token_rotation = true`:
- Each refresh token can only be used **once**
- After successful refresh, old token is immediately invalid
- If two refresh attempts use the same token, second one fails with "already used"

### The Actual Problem

The gate mechanism works correctly for preventing parallel execution, BUT:
- The refresh token is captured in the closure **before** the gate check
- If two calls both read the same token and both determine they need to refresh, they both pass the same token to `refreshSessionWithGate()`
- Even though only one refresh executes, if there's any code path that causes the second refresh function to execute, it will use the old (now invalid) token

**However, the logs suggest both refreshes ARE executing**, which means the gate isn't working as expected, OR there's another code path that bypasses the gate.

## Impact

- Users are signed out after ~1 hour of inactivity (when access token expires)
- Refresh token rotation means old tokens can't be reused
- Multiple simultaneous refresh attempts cause "already used" error
- User must sign in again manually

## The Real Fix Needed

The refresh token should be read **INSIDE** the refresh function, not passed as a parameter. This ensures:
1. If a refresh is already in progress, waiting calls will read the NEW token after refresh completes
2. No stale tokens are captured in closures
3. The gate mechanism works correctly

**Current (Broken) Pattern**:
```typescript
// Token read BEFORE gate check
const token = session.refresh_token;
await refreshSessionWithGate(token); // Token captured in closure
```

**Correct Pattern**:
```typescript
// No token parameter - read inside refresh function
await refreshSessionWithGate(); // Reads token from storage inside
```

## Next Steps

1. **Fix `refreshSessionWithGate()`**: Remove `refreshToken` parameter, read token from storage inside the refresh function
2. **Update all call sites**: Remove token parameter when calling `refreshSessionWithGate()`
3. **Add error handling**: Handle "refresh_token_already_used" by reading new token and retrying
4. **Add logging**: Track when tokens are read vs when refreshes start to debug timing issues

