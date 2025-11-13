# Swift Package Manager (SPM) Setup Instructions for iOS

Since we're using SPM instead of CocoaPods, you need to manually add Firebase packages via Xcode.

## Step 1: Open Xcode Project

```bash
open ios/SwapJoy.xcodeproj
```

**Note:** Use `.xcodeproj` (not `.xcworkspace`) since we're not using CocoaPods.

## Step 2: Add Firebase Packages via SPM

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

## Step 3: Select Required Firebase Products

After clicking "Add Package", you'll see a list of Firebase products. Select:

- ✅ **FirebaseCore** (required)
- ✅ **FirebaseMessaging** (required for push notifications)
- ✅ **FirebaseInstallations** (required by FirebaseMessaging)
- ✅ **GoogleUtilities** (required dependency)
- ✅ **PromisesObjC** (required dependency)
- ✅ **nanopb** (required dependency)

Click **Add Package** to add them to your project.

## Step 4: Add GoogleService-Info.plist to Xcode

1. In Xcode, right-click on the **SwapJoy** folder in the project navigator
2. Select **Add Files to "SwapJoy"...**
3. Navigate to `ios/SwapJoy/GoogleService-Info.plist`
4. Select the file
5. ✅ Check **"Copy items if needed"** (if not already in the folder)
6. ✅ Check **"Add to targets: SwapJoy"**
7. Click **Add**

## Step 5: Enable Push Notifications Capability

1. In Xcode, select the **SwapJoy** target
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **Push Notifications**
5. Add **Background Modes** and check ✅ **Remote notifications**

## Step 6: Initialize Firebase in AppDelegate

The `AppDelegate.swift` file is at `ios/SwapJoy/AppDelegate.swift`. 

You need to import Firebase and initialize it. However, since React Native Firebase handles initialization automatically, you may not need to add Firebase initialization code manually.

**If needed**, add this to `AppDelegate.swift`:

```swift
import FirebaseCore

public override func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
) -> Bool {
  // Initialize Firebase
  FirebaseApp.configure()
  
  // ... rest of existing code
}
```

**Note:** React Native Firebase typically handles this automatically, so verify if this is needed.

## Step 7: Link React Native Firebase

React Native Firebase should be automatically linked via autolinking. Verify:

1. In Xcode, select the **SwapJoy** target
2. Go to **Build Phases** tab
3. Expand **Link Binary With Libraries**
4. You should see:
   - `libRNFBApp.a` (or `RNFBApp.xcframework`)
   - `libRNFBMessaging.a` (or `RNFBMessaging.xcframework`)

If they're not there, you may need to:
1. Run `cd ios && pod install` (but this will install CocoaPods)
2. Or manually link the frameworks

**Alternative:** Since we're using SPM, React Native Firebase might need manual linking. Check the React Native Firebase documentation for SPM support.

## Step 8: Configure APNs (Apple Push Notification Service)

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

## Troubleshooting

### "No such module 'FirebaseCore'"
- Verify Firebase packages are added via SPM
- Clean build folder (Product → Clean Build Folder)
- Rebuild project

### "GoogleService-Info.plist not found"
- Verify the file is in `ios/SwapJoy/` directory
- Verify it's added to the Xcode project
- Check it's in the target's "Copy Bundle Resources" build phase

### Push Notifications Not Working
- Verify Push Notifications capability is enabled
- Verify APNs certificates are configured
- **Must test on a physical device** (simulators don't support push)

## Next Steps

After completing the SPM setup:
1. Build and run the app
2. Verify device registration on sign-in
3. Test push notifications using test buttons in `DevRecommendationSettingsScreen`





