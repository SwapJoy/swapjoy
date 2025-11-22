# SPM Setup - Automated Configuration

This document tracks what has been automated and what requires manual Xcode steps.

## ✅ Already Completed (Automated)

1. ✅ **Removed CocoaPods files**
   - Deleted `Podfile`, `Podfile.properties.json`, `Podfile.lock`
   - Removed `Pods` directory

2. ✅ **iOS Configuration**
   - Added `UIBackgroundModes` with `remote-notification` to `Info.plist`
   - Copied `GoogleService-Info.plist` to `ios/SwapJoy/` directory

3. ✅ **Android Configuration**
   - Added Google Services plugin to `android/build.gradle`
   - Applied Google Services plugin in `android/app/build.gradle`
   - Added Firebase BoM (Bill of Materials) for version compatibility
   - Updated `AndroidManifest.xml` with notification permissions and Firebase metadata
   - Created notification channel in `MainApplication.kt`
   - Created notification icon (`ic_notification.xml`)
   - Added notification color to `colors.xml`
   - Copied `google-services.json` to `android/app/`

## ⚠️ Manual Steps Required in Xcode

Since React Native Firebase's native modules need to be linked, and we're using SPM instead of CocoaPods, you need to complete these steps in Xcode:

### Step 1: Open Xcode Project

```bash
open ios/SwapJoy.xcodeproj
```

**Important:** Use `.xcodeproj` (not `.xcworkspace`) since we're not using CocoaPods.

### Step 2: Add Firebase iOS SDK via SPM

1. In Xcode, select your project in the navigator (top item: "SwapJoy")
2. Select the **SwapJoy** target
3. Go to the **Package Dependencies** tab
4. Click the **+** button (bottom left)
5. In the search field, enter:
   ```
   https://github.com/firebase/firebase-ios-sdk.git
   ```
6. Select **Up to Next Major Version** and choose the latest version (e.g., `11.0.0` or latest)
7. Click **Add Package**

### Step 3: Select Required Firebase Products

After clicking "Add Package", select:

- ✅ **FirebaseCore** (required)
- ✅ **FirebaseMessaging** (required for push notifications)
- ✅ **FirebaseInstallations** (required by FirebaseMessaging)
- ✅ **GoogleUtilities** (required dependency)
- ✅ **PromisesObjC** (required dependency)
- ✅ **nanopb** (required dependency)

Click **Add Package**.

### Step 4: Add GoogleService-Info.plist to Xcode Project

1. In Xcode, right-click on the **SwapJoy** folder in the project navigator
2. Select **Add Files to "SwapJoy"...**
3. Navigate to `ios/SwapJoy/GoogleService-Info.plist`
4. Select the file
5. ✅ Check **"Copy items if needed"** (if not already in the folder)
6. ✅ Check **"Add to targets: SwapJoy"**
7. Click **Add**

### Step 5: Enable Push Notifications Capability

1. In Xcode, select the **SwapJoy** target
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **Push Notifications**
5. Add **Background Modes** and check ✅ **Remote notifications**

### Step 6: React Native Firebase Linking

**Important Note:** React Native Firebase's native modules are typically linked via CocoaPods. Since we're using SPM, we have two options:

#### Option A: Use React Native Firebase with Manual Linking (Recommended)

React Native Firebase should auto-link via React Native's autolinking system. However, you may need to:

1. **Verify autolinking works:**
   - Build the project (⌘B)
   - Check if React Native Firebase modules are automatically linked
   - If they are, you're done!

2. **If autolinking fails**, you may need to manually link:
   - Check Build Phases → Link Binary With Libraries
   - You should see `libRNFBApp.a` and `libRNFBMessaging.a`
   - If not, React Native's autolinking might not work with SPM

#### Option B: Use Native Firebase SDK Directly (Alternative)

If React Native Firebase doesn't work with SPM, you can:

1. Use the native Firebase SDK (already added via SPM)
2. Create a custom React Native bridge for Firebase Messaging
3. Use the native SDK directly in your Swift/Objective-C code

**Note:** This is more complex but gives you full control.

### Step 7: Configure APNs (Apple Push Notification Service)

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID (e.g., `com.leongoldfeld.SwapJoy`)
4. Enable **Push Notifications** capability
5. Create/Download APNs certificates:
   - For Development: Create a **Development** SSL certificate
   - For Production: Create a **Production** SSL certificate
6. Download and install the certificates in Keychain

## Verification

After completing these steps:

1. Build the project in Xcode (⌘B)
2. Verify there are no build errors
3. Test on a physical device (simulators don't support push notifications)
4. Check that device registration works on sign-in
5. Test push notifications using test buttons in `DevRecommendationSettingsScreen`

## Troubleshooting

### "No such module 'FirebaseCore'"
- ✅ Verify Firebase packages are added via SPM (Package Dependencies tab)
- ✅ Clean build folder (Product → Clean Build Folder)
- ✅ Rebuild project

### "GoogleService-Info.plist not found"
- ✅ Verify the file is in `ios/SwapJoy/` directory
- ✅ Verify it's added to the Xcode project (should appear in project navigator)
- ✅ Check it's in the target's "Copy Bundle Resources" build phase

### "React Native Firebase not found"
- ✅ Verify `@react-native-firebase/app` and `@react-native-firebase/messaging` are in `package.json`
- ✅ Check if React Native's autolinking works (should link automatically)
- ✅ If autolinking fails, React Native Firebase may require CocoaPods
- ⚠️ **Alternative:** Use native Firebase SDK directly via SPM

### Push Notifications Not Working
- ✅ Verify Push Notifications capability is enabled in Xcode
- ✅ Verify APNs certificates are configured in Apple Developer Portal
- ✅ **Must test on a physical device** (simulators don't support push)
- ✅ Check notification permissions are granted in iOS Settings

## Next Steps

Once Xcode setup is complete:

1. Build and run the app
2. Verify device registration on sign-in
3. Test push notifications using test buttons in `DevRecommendationSettingsScreen`
4. Verify notifications appear and deep linking works

## Summary

- ✅ **Android:** Fully configured and ready to build
- ✅ **iOS:** Native folders generated, config files copied
- ⚠️ **iOS:** Requires manual Xcode steps for SPM package addition
- ⚠️ **iOS:** React Native Firebase linking may need verification






