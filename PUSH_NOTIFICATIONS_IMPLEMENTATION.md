# Push Notifications Implementation Summary

Complete implementation of Firebase Cloud Messaging (FCM) push notifications for SwapJoy.

## ✅ Implementation Complete

### 1. Database Schema
- ✅ `devices` table: Stores FCM tokens per device (supports multiple devices per user)
- ✅ `notification_type` enum: `new_offer`, `offer_decision`, `new_follower`, `swap_confirmed`, `followed_user_new_item`
- ✅ `notifications` table: Stores notification records with type, title, message, and data fields
- ✅ RLS policies: Users can manage their own devices and view their own notifications

**Migration applied:** `update_notifications_type_to_enum`

### 2. Supabase Edge Function
- ✅ **Location:** `supabase/functions/push/index.ts`
- ✅ **Features:**
  - Handles webhook payloads from notifications INSERT
  - Fetches all enabled devices for user
  - Sends FCM notifications to each device
  - Retry logic with exponential backoff (3 attempts, 1s initial delay)
  - Invalid token handling (disables device automatically)
  - Comprehensive error handling and logging

### 3. Database Webhook
- ✅ **Trigger:** `notify_push_on_notification_insert` on `public.notifications` INSERT
- ✅ **Function:** `notify_push_function()` calls push Edge Function via pg_net
- ✅ **URL:** `https://glbvyusqksnoyjuztceo.supabase.co/functions/v1/push`

**Migration applied:** `create_notifications_webhook_using_pg_net`

### 4. Mobile Device Registration
- ✅ **Service:** `mobile/SwapJoy/services/deviceService.ts`
- ✅ **Features:**
  - Request notification permissions (iOS/Android)
  - Get device ID using `expo-application.getInstallationIdAsync()`
  - Get FCM token from `@react-native-firebase/messaging`
  - Register/update device in Supabase
  - Disable device on sign-out
  - Token refresh listener
- ✅ **Integration:** Automatically registers device on sign-in via `AuthContext`

### 5. Push Notification Handlers
- ✅ **Service:** `mobile/SwapJoy/services/pushNotificationService.ts`
- ✅ **Features:**
  - Foreground handler (app open)
  - Background handler (app in background)
  - Notification opened handler (tap from background/quit)
  - Deep link navigation based on notification type
  - Navigation ref management
- ✅ **Integration:** Initialized in `App.tsx` on app start

### 6. Notification Service
- ✅ **Location:** `mobile/SwapJoy/services/notificationService.ts`
- ✅ **Features:**
  - Generic `createNotification()` method
  - Helper methods for each notification type:
    - `notifyNewOffer()`
    - `notifyOfferDecision()`
    - `notifyNewFollower()`
    - `notifySwapConfirmed()`
    - `notifyFollowedUserNewItem()`

### 7. Deep Link Routing
- ✅ **Routes:**
  - `new_offer` → Offers screen (received tab)
  - `offer_decision` → Offers screen (sent tab)
  - `new_follower` → User Profile
  - `swap_confirmed` → Offers screen
  - `followed_user_new_item` → Item Details or User Profile

### 8. Test Buttons
- ✅ **Location:** `DevRecommendationSettingsScreen`
- ✅ **Features:** Test buttons for "New Offer" and "New Follower" notifications

## 📋 Deployment Steps

### Step 1: Deploy Edge Function

```bash
cd /Users/iraklivasha/Desktop/projects/SwapJoy/swapjoy
supabase functions deploy push
```

The function will automatically use `service-account.json` from `supabase/functions/` directory.

**Alternative:** If you want to use environment variable instead:
1. Set secret in Supabase Dashboard → Edge Functions → Secrets
2. Add `FIREBASE_SERVICE_ACCOUNT` with the JSON content as a string

### Step 2: Verify Database Webhook

The webhook trigger is already created via migration. Verify it's working:

1. Go to Supabase Dashboard → Database → Webhooks
2. Check that webhook exists for `notifications` table INSERT event
3. Or verify via SQL:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'notify_push_on_notification_insert';
   ```

### Step 3: Complete Native Firebase Setup

Follow the guide in `mobile/SwapJoy/NATIVE_FIREBASE_SETUP.md`:

1. Run `npx expo prebuild` to generate native folders
2. Install dependencies: `npm install`
3. Install iOS pods: `cd ios && pod install && cd ..`
4. Configure iOS: Enable Push Notifications capability in Xcode
5. Configure Android: Update `build.gradle` files
6. Copy Firebase config files to native projects

### Step 4: Test End-to-End

1. **Sign in to the app**
   - Device should automatically register
   - Check console logs for "Device registered successfully"

2. **Verify device in database:**
   ```sql
   SELECT * FROM devices WHERE user_id = 'your-user-id';
   ```

3. **Test notification:**
   - Go to DevRecommendationSettingsScreen
   - Tap "Test New Offer Notification"
   - Check device for push notification
   - Tap notification and verify it navigates to Offers screen

4. **Test via SQL:**
   ```sql
   INSERT INTO notifications (user_id, type, title, message, data)
   VALUES (
     'your-user-id',
     'new_offer',
     'Test Notification',
     'This is a test notification',
     '{"offerId": "test-123"}'::jsonb
   );
   ```

## 🔍 Verification Checklist

- [ ] Edge Function deployed successfully
- [ ] Database webhook trigger exists and is active
- [ ] Service account JSON file is in place (or env var set)
- [ ] Native Firebase setup completed (iOS + Android)
- [ ] Device registered on sign-in (check `devices` table)
- [ ] FCM token obtained and stored in database
- [ ] Test notification sent and received
- [ ] Deep link navigation works when tapping notification
- [ ] Token refresh works (test by uninstalling/reinstalling app)

## 📝 Notification Types Mapping

| Type | Title | Message Format | Navigation |
|------|-------|---------------|------------|
| `new_offer` | "New Offer Received" | "{senderName} wants to swap with you" | Offers (received tab) |
| `offer_decision` | "Offer Update" | "Your offer was {accepted/declined}" | Offers (sent tab) |
| `new_follower` | "New Follower" | "{followerName} started following you" | User Profile |
| `swap_confirmed` | "Swap Confirmed" | "Swap confirmed! - {itemTitle}" | Offers |
| `followed_user_new_item` | "New Item from Followed User" | "{userName} added a new item: {itemTitle}" | Item Details |

## 🛠️ Troubleshooting

### No push notification received
1. Check device is registered: `SELECT * FROM devices WHERE user_id = ?`
2. Check device is enabled: `enabled = true`
3. Check FCM token is valid (not null)
4. Check Edge Function logs in Supabase Dashboard
5. Verify notification was inserted into `notifications` table
6. Check webhook is firing (check `net.http_request` logs)

### Invalid token errors
- Edge Function automatically disables devices with invalid tokens
- User needs to re-register device (will happen on next sign-in)
- Check `devices` table: `enabled = false` means token is invalid

### Deep link not working
- Verify navigation ref is set in `PushNotificationService`
- Check notification data contains required fields (type, itemId, offerId, etc.)
- Verify navigation routes exist in `AppNavigator`

## 📚 Related Files

- **Edge Function:** `supabase/functions/push/index.ts`
- **Device Service:** `mobile/SwapJoy/services/deviceService.ts`
- **Push Handler:** `mobile/SwapJoy/services/pushNotificationService.ts`
- **Notification Service:** `mobile/SwapJoy/services/notificationService.ts`
- **Auth Context:** `mobile/SwapJoy/contexts/AuthContext.tsx`
- **App Entry:** `mobile/SwapJoy/App.tsx`
- **Setup Guide:** `mobile/SwapJoy/NATIVE_FIREBASE_SETUP.md`

## 🎯 Next Steps

1. Complete native Firebase setup (follow `NATIVE_FIREBASE_SETUP.md`)
2. Deploy Edge Function
3. Test end-to-end with test buttons
4. Integrate notification creation into business logic:
   - Create notifications when offers are created
   - Create notifications when offers are accepted/declined
   - Create notifications when users follow each other
   - Create notifications when swaps are confirmed
   - Create notifications when followed users add items




