# Push Notifications Setup - Final Steps

## ✅ Completed

1. ✅ Edge Function `push` deployed successfully
2. ✅ Database trigger `notify_push_on_notification_insert` exists
3. ✅ `devices` table exists
4. ✅ `notifications` table exists with proper structure

## 🔧 Required Setup Steps

### 1. Set Firebase Service Account Secret

The Edge Function needs access to your Firebase service account credentials. You need to set this as an environment variable in Supabase.

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to your Supabase project: https://supabase.com/dashboard/project/glbvyusqksnoyjuztceo
2. Navigate to **Edge Functions** → **push** → **Settings**
3. Scroll to **Secrets** section
4. Add a new secret:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: The entire JSON content from `supabase/functions/service-account.json` (as a single-line JSON string)

**Option B: Via Supabase CLI** (if you have it installed)
```bash
# Read the service account file and set it as a secret
cd supabase/functions
supabase secrets set FIREBASE_SERVICE_ACCOUNT="$(cat service-account.json | jq -c)"
```

**Important**: The value should be the entire JSON object as a single-line string. You can use:
```bash
# From the project root
cat supabase/functions/service-account.json | jq -c
```

### 2. Disable JWT Verification for Push Function

The Edge Function is called from a database trigger, which doesn't include user authentication. You need to disable JWT verification:

1. Go to **Edge Functions** → **push** → **Settings**
2. Toggle **"Verify JWT"** to **OFF**
3. Save changes

**Why?** The database trigger calls the function without a user JWT token, so JWT verification must be disabled.

### 3. Verify Database Trigger is Working

The trigger function uses `pg_net` to make HTTP requests. Verify it's working:

```sql
-- Test the trigger by inserting a test notification
-- (Replace USER_ID with an actual user ID from your database)
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  'YOUR_USER_ID_HERE',
  'new_offer',
  'Test Notification',
  'This is a test notification',
  '{"offerId": "test-123"}'::jsonb
);
```

Then check the Edge Function logs:
1. Go to **Edge Functions** → **push** → **Logs**
2. Look for the request and any errors

### 4. Test End-to-End Flow

1. **Install native Firebase in your mobile app** (follow `mobile/SwapJoy/NATIVE_FIREBASE_SETUP.md`)
2. **Sign in to the app** - device should automatically register
3. **Use test buttons** in `DevRecommendationSettingsScreen` to trigger notifications
4. **Verify**:
   - Notification appears on device
   - Tapping notification navigates to correct screen
   - Device registration works (check `devices` table in Supabase)

## 📋 Checklist

- [ ] Set `FIREBASE_SERVICE_ACCOUNT` secret in Supabase
- [ ] Disable JWT verification for `push` function
- [ ] Test database trigger with a test notification
- [ ] Complete native Firebase setup in mobile app
- [ ] Test device registration on sign-in
- [ ] Test push notification delivery
- [ ] Test deep linking from notification

## 🐛 Troubleshooting

### Edge Function Returns 401 Unauthorized
- **Cause**: JWT verification is still enabled
- **Fix**: Disable JWT verification in function settings

### Edge Function Can't Find Firebase Service Account
- **Cause**: Secret not set or incorrectly formatted
- **Fix**: Verify the secret is set correctly (should be a single-line JSON string)

### No Devices Found
- **Cause**: User hasn't signed in or device registration failed
- **Fix**: Check `devices` table, verify `DeviceService.registerDevice()` is called on sign-in

### FCM Token Invalid
- **Cause**: App reinstalled or token expired
- **Fix**: The function automatically disables devices with invalid tokens. User needs to sign in again to get a new token.

### Notification Not Received
- **Cause**: Device not registered, permissions not granted, or app not running
- **Fix**: 
  1. Check `devices` table for user's devices
  2. Verify notification permissions are granted
  3. Check Edge Function logs for errors
  4. Verify FCM token is valid

## 📚 Next Steps

After completing the setup:
1. Test all notification types:
   - New offer received
   - Offer accepted/declined
   - New follower
   - Swap confirmed
   - User you follow added an item
2. Implement notification preferences UI
3. Add notification badges/counters
4. Set up notification analytics



