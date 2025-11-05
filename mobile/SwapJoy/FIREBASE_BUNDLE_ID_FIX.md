# Firebase Bundle ID Mismatch Fix

## Problem

The `GoogleService-Info.plist` file has a bundle ID mismatch:
- **Plist file**: `com.swapjoy` (original)
- **App bundle ID**: `com.leongoldfeld.SwapJoy` (actual)

Firebase won't initialize if the bundle ID in the plist doesn't match the app's bundle ID.

## Solution

### Option 1: Add New iOS App in Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/swapjoy-b8855/settings/general)
2. Scroll to **"Your apps"** section
3. Click **"Add app"** → Select **iOS** (Apple icon)
4. Enter bundle ID: `com.leongoldfeld.SwapJoy`
5. Download the new `GoogleService-Info.plist`
6. Replace `ios/SwapJoy/GoogleService-Info.plist` with the new file
7. Rebuild the app: `npx expo run:ios`

### Option 2: Update Existing iOS App

If an iOS app already exists:
1. Go to Firebase Console → Project Settings → Your apps
2. Find the iOS app
3. Click the settings icon (gear) next to it
4. Update the bundle ID to `com.leongoldfeld.SwapJoy`
5. Download the updated `GoogleService-Info.plist`
6. Replace the file in your project
7. Rebuild the app

## Verification

After rebuilding, check Xcode console for:
- `✅ Found GoogleService-Info.plist at: ...`
- `✅ Firebase initialized successfully`

If you still see errors, the plist file might not be in the app bundle. Add it manually in Xcode:
1. Open `ios/SwapJoy.xcworkspace` in Xcode
2. Right-click SwapJoy folder → "Add Files to SwapJoy..."
3. Select `GoogleService-Info.plist`
4. Ensure "Copy items if needed" and "Add to targets: SwapJoy" are checked
5. Click "Add"

