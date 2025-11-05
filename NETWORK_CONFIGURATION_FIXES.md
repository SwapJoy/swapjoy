# Network Configuration Fixes

## Root Causes of "Network request failed" Errors

### 1. Missing Environment Variables
**Issue:** `EXPO_PUBLIC_SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_ANON_KEY` not set
**Fix:** Added validation in `config/supabase.ts` with clear error messages

### 2. iOS Network Security
**Issue:** iOS blocking network requests
**Fix:** Added `NSAppTransportSecurity` to `app.json` and `Info.plist`

### 3. Supabase Client Configuration
**Issue:** No custom fetch handler for React Native network errors
**Fix:** Added custom fetch handler in `lib/supabase.ts` with proper error logging

### 4. Session Hydration Errors
**Issue:** Network errors during auth session hydration ignored
**Fix:** Added network error detection and logging in `api.ts`

## Changes Made

### 1. `config/supabase.ts`
- Added validation for missing environment variables
- Added URL format validation
- Added key length validation
- Clear error messages pointing to configuration issues

### 2. `lib/supabase.ts`
- Added custom fetch handler with network error detection
- Validates configuration before making requests
- Enhanced error logging with URL and error details
- Prevents client creation if URL/key missing

### 3. `app.json`
- Added `NSAppTransportSecurity` to iOS config
- Allows arbitrary loads and local networking

### 4. `services/api.ts`
- Added network error detection in session hydration
- Logs network errors with attempt numbers
- Re-throws network errors on final attempt

## How to Verify Configuration

### Check Console Logs
1. `[config/supabase] URL set: true KEY set: true` - Configuration present
2. `[config/supabase] URL valid: true` - URL format correct
3. `[Supabase] URL present: true KEY present: true` - Client can be created
4. `[Supabase] Fetch exception:` - Network errors with details

### If Still Getting Errors
1. Check if `.env` file exists with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Restart Expo/Metro bundler after adding env vars
3. Check network connectivity
4. Verify Supabase URL is accessible

## Next Steps
1. Check console for `[config/supabase] CONFIGURATION ERROR` messages
2. Verify environment variables are set correctly
3. Check `[Supabase] Fetch exception:` logs for specific error details

