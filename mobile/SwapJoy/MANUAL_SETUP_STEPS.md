# Manual Setup Steps for Firebase Push Notifications

## Current Status

✅ **Completed:**
- iOS Podfile updated with `Firebase/Messaging`
- Android Firebase configuration complete
- Info.plist updated with `UIBackgroundModes` (remote-notification)
- Entitlements updated with `aps-environment` (development)
- GoogleService-Info.plist copied to `ios/SwapJoy/`
- google-services.json copied to `android/app/`

⚠️ **Pending (due to CocoaPods ffi issue):**
- Running `pod install` - blocked by architecture mismatch
- Opening Xcode workspace - needs `pod install` to complete first

## Fix CocoaPods Issue First

The CocoaPods ffi gem has an architecture mismatch. Fix it using one of these methods (see `COCOAPODS_FIX.md`):

### Option 1: Reinstall ffi gem (Requires sudo)
```bash
sudo gem uninstall ffi -x
sudo arch -arm64 gem install ffi
cd ios
pod install
```

### Option 2: Use Homebrew Ruby (Recommended)
```bash
# Install Ruby via Homebrew
brew install ruby

# Add to ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Install CocoaPods
gem install cocoapods

# Install pods
cd ios
pod install
```

## After CocoaPods is Fixed

### 1. Open Xcode Workspace (NOT .xcodeproj)
```bash
cd ios
open SwapJoy.xcworkspace
```

**Important:** Always use `.xcworkspace`, not `.xcodeproj` when using CocoaPods.

### 2. Add GoogleService-Info.plist to Xcode Project

1. In Xcode, right-click on the **SwapJoy** folder in the project navigator
2. Select **Add Files to "SwapJoy"...**
3. Navigate to `ios/SwapJoy/GoogleService-Info.plist`
4. Select the file
5. ✅ Check **"Copy items if needed"** (if not already in the folder)
6. ✅ Check **"Add to targets: SwapJoy"**
7. Click **Add**

### 3. Enable Push Notifications Capability

1. In Xcode, select the **SwapJoy** target (top item in project navigator)
2. Go to the **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **Push Notifications**
5. Click **+ Capability** again
6. Add **Background Modes**
7. Check ✅ **Remote notifications**

### 4. Verify Firebase Initialization

Check `AppDelegate.swift` - Firebase should be initialized automatically by React Native Firebase. If needed, add:

```swift
import FirebaseCore

public override func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
) -> Bool {
  // Initialize Firebase (if not auto-initialized)
  FirebaseApp.configure()
  
  // ... rest of existing code
}
```

**Note:** React Native Firebase typically handles this automatically, so this may not be needed.

### 5. Configure APNs (Apple Push Notification Service)

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID (e.g., `com.leongoldfeld.SwapJoy`)
4. Enable **Push Notifications** capability
5. Create/Download APNs certificates:
   - For Development: Create a **Development** SSL certificate
   - For Production: Create a **Production** SSL certificate
6. Download and install the certificates in Keychain
7. Upload the certificates to Firebase Console:
   - Go to Firebase Console → Project Settings → Cloud Messaging
   - Upload APNs certificates for iOS

### 6. Build and Test

1. Build the project in Xcode (⌘B)
2. Verify there are no build errors
3. **Test on a physical device** (simulators don't support push notifications)
4. Run the app and verify device registration works

## Android Setup (Already Complete)

Android configuration is already complete:
- ✅ Google Services plugin added
- ✅ Firebase BoM and Messaging dependency added
- ✅ Notification permission added
- ✅ Notification channel created in MainApplication.kt
- ✅ google-services.json in place

Just build and run:
```bash
cd android
./gradlew assembleDebug
```

## Testing Push Notifications

1. **Sign in to the app** - Device should auto-register
2. **Check device registration** in Supabase `devices` table
3. **Use test buttons** in `DevRecommendationSettingsScreen` to send test notifications
4. **Verify notifications appear** on device

## Troubleshooting

### "No such module 'React'"
- Make sure you're using `.xcworkspace`, not `.xcodeproj`
- Run `pod install` in the `ios` directory
- Clean build folder: Product → Clean Build Folder (⇧⌘K)

### "GoogleService-Info.plist not found"
- Verify the file is in `ios/SwapJoy/` directory
- Verify it's added to the Xcode project
- Check it's in the target's "Copy Bundle Resources" build phase

### Push Notifications Not Working
- Verify Push Notifications capability is enabled
- Verify APNs certificates are configured
- **Must test on a physical device** (simulators don't support push)
- Check Firebase Console for APNs certificate upload

### CocoaPods Still Failing
- Try Option 2 (Homebrew Ruby) - it's the most reliable
- Check Ruby version: `ruby -v` (should be arm64)
- Verify gem installation: `gem list | grep ffi`

## Next Steps After Setup

1. Test device registration on sign-in
2. Test push notifications from Edge Function
3. Configure APNs for production
4. Test on physical devices (iOS and Android)

