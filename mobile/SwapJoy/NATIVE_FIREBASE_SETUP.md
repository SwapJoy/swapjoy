# Native Firebase Cloud Messaging Setup Guide

This guide walks you through setting up native Firebase Cloud Messaging for push notifications using **Swift Package Manager (SPM)** for iOS and latest best practices for Android.

## Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- Xcode 14+ (for iOS)
- Android Studio (for Android)
- Firebase project created with iOS and Android apps registered

## Step 1: Generate Native Folders

Run Expo prebuild to generate native iOS and Android folders:

```bash
cd mobile/SwapJoy
npx expo prebuild --clean
```

This will create/update the `ios/` and `android/` folders with native code.

### 1.1 Copy Firebase Configuration Files

After prebuild, run the setup script to copy Firebase config files:

```bash
./setup-firebase.sh
```

Or manually copy:
```bash
cp config/GoogleService-Info.plist ios/SwapJoy/GoogleService-Info.plist
cp config/google-services.json android/app/google-services.json
```

## Step 2: Install React Native Firebase Dependencies

The dependencies are already in `package.json`. Install them:

```bash
npm install
```

You should have:
- `@react-native-firebase/app@^20.0.0`
- `@react-native-firebase/messaging@^20.0.0`

## Step 3: iOS Setup (Swift Package Manager)

### 3.1 Add Firebase iOS SDK via Swift Package Manager

1. **Open the Xcode project:**
   ```bash
   open ios/SwapJoy.xcworkspace
   ```
   If `.xcworkspace` doesn't exist, open `ios/SwapJoy.xcodeproj` instead.

2. **Add Firebase packages:**
   - In Xcode, go to **File** → **Add Packages...**
   - Enter the Firebase repository URL:
     ```
     https://github.com/firebase/firebase-ios-sdk.git
     ```
   - Select **Up to Next Major Version** and choose the latest version (e.g., `11.0.0` or latest)
   - Click **Add Package**

3. **Select required Firebase products:**
   For React Native Firebase, you need:
   - ✅ **FirebaseCore**
   - ✅ **FirebaseMessaging**
   - ✅ **FirebaseInstallations** (required by FirebaseMessaging)
   - ✅ **GoogleUtilities** (required dependency)
   - ✅ **PromisesObjC** (required dependency)
   - ✅ **nanopb** (required dependency)

   Click **Add Package** to add them to your project.

4. **Verify package dependencies:**
   - In Xcode, select your project in the navigator
   - Select the **SwapJoy** target
   - Go to **General** tab → **Frameworks, Libraries, and Embedded Content**
   - Verify Firebase frameworks are listed

### 3.2 Add GoogleService-Info.plist

The file is already at `config/GoogleService-Info.plist`. Copy it to the iOS project:

```bash
cp config/GoogleService-Info.plist ios/SwapJoy/GoogleService-Info.plist
```

Then in Xcode:
1. Right-click on the `SwapJoy` folder in the project navigator
2. Select **Add Files to "SwapJoy"...**
3. Select `ios/SwapJoy/GoogleService-Info.plist`
4. ✅ Check **"Copy items if needed"**
5. ✅ Check **"Add to targets: SwapJoy"**
6. Click **Add**

### 3.3 Configure Info.plist

Add push notification background mode. The file is at `ios/SwapJoy/Info.plist`:

1. Open `Info.plist` in Xcode
2. Add the following key (if not already present):
   ```xml
   <key>UIBackgroundModes</key>
   <array>
       <string>remote-notification</string>
   </array>
   ```

Alternatively, you can add it via Xcode:
- Select the **SwapJoy** target
- Go to **Info** tab
- Under **Custom iOS Target Properties**, find or add **"Background Modes"**
- Check ✅ **"Remote notifications"**

### 3.4 Enable Push Notifications Capability

1. In Xcode, select the **SwapJoy** target
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **Push Notifications**
5. Add **Background Modes** and check ✅ **Remote notifications**

### 3.5 Configure APNs (Apple Push Notification Service)

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID (e.g., `com.swapjoy`)
4. Enable **Push Notifications** capability
5. Create/Download APNs certificates:
   - For Development: Create a **Development** SSL certificate
   - For Production: Create a **Production** SSL certificate
6. Download and install the certificates in Keychain

### 3.6 Link React Native Firebase (Manual Linking)

Since we're using SPM, React Native Firebase needs to be linked manually:

1. **Check if React Native Firebase is linked:**
   - In Xcode, select your project
   - Go to **Build Phases** → **Link Binary With Libraries**
   - You should see:
     - `libRNFBApp.a` (or `RNFBApp.xcframework`)
     - `libRNFBMessaging.a` (or `RNFBMessaging.xcframework`)

2. **If not linked, add manually:**
   - Click **+** button
   - Search for `RNFBApp` and `RNFBMessaging`
   - Add them to your target

3. **Add React Native Firebase to Header Search Paths:**
   - Select the **SwapJoy** target
   - Go to **Build Settings** tab
   - Search for **Header Search Paths**
   - Add:
     ```
     $(SRCROOT)/../node_modules/@react-native-firebase/app/ios/RNFBApp
     $(SRCROOT)/../node_modules/@react-native-firebase/messaging/ios/RNFBMessaging
     ```

### 3.7 Update AppDelegate (if needed)

Check if `ios/SwapJoy/AppDelegate.mm` or `AppDelegate.swift` exists. If it needs Firebase initialization:

**For Objective-C (`AppDelegate.mm`):**
```objc
#import <Firebase.h>
#import <RNFBApp/RNFBAppModule.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  // ... rest of your code
}
```

**For Swift (`AppDelegate.swift`):**
```swift
import FirebaseCore

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    FirebaseApp.configure()
    // ... rest of your code
  }
}
```

**Note:** React Native Firebase typically handles initialization automatically, but verify it works.

## Step 4: Android Setup (Latest Best Practices)

### 4.1 Add google-services.json

The file is already at `config/google-services.json`. Copy it to the Android project:

```bash
cp config/google-services.json android/app/google-services.json
```

### 4.2 Update Project-Level build.gradle

Edit `android/build.gradle`:

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.0"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        // Add Google Services plugin
        classpath("com.google.gms:google-services:4.4.0")
    }
}
```

### 4.3 Update App-Level build.gradle

Edit `android/app/build.gradle`:

```gradle
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
    // Add Google Services plugin
    id("com.google.gms.google-services")
}

android {
    namespace = "com.swapjoy"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.swapjoy"
        minSdk = 23
        targetSdk = 34
        // ... other config
    }
    
    // ... rest of config
}

dependencies {
    // React Native Firebase dependencies are automatically linked
    // via @react-native-firebase/app plugin in app.json
    
    // Firebase BoM (Bill of Materials) - ensures version compatibility
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    
    // Firebase Cloud Messaging (optional, React Native Firebase handles this)
    // implementation("com.google.firebase:firebase-messaging")
    
    // ... other dependencies
}
```

**Note:** Using Firebase BoM ensures all Firebase libraries use compatible versions. React Native Firebase handles the actual FCM implementation, but having the BoM helps with dependency resolution.

### 4.4 Update AndroidManifest.xml

Edit `android/app/src/main/AndroidManifest.xml`:

Add required permissions (if not already present):

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Internet permission (usually already present) -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Notification permission for Android 13+ -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Vibration permission for notifications -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <!-- ... other components -->
        
        <!-- Firebase Cloud Messaging default notification channel -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="swapjoy_default_channel" />
            
        <!-- Firebase Cloud Messaging default notification icon -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_notification" />
            
        <!-- Firebase Cloud Messaging default notification color -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/notification_color" />
        
    </application>
</manifest>
```

### 4.5 Create Notification Channel (Android 8.0+)

Create a default notification channel. You can add this in your `MainApplication.java` or `MainApplication.kt`:

**For Java (`android/app/src/main/java/com/swapjoy/MainApplication.java`):**
```java
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import com.facebook.react.PackageList;
// ... other imports

public class MainApplication extends Application implements ReactApplication {
    @Override
    public void onCreate() {
        super.onCreate();
        
        // Create default notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "swapjoy_default_channel",
                "SwapJoy Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notifications for SwapJoy app");
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
        
        // ... rest of initialization
    }
}
```

**For Kotlin (`android/app/src/main/java/com/swapjoy/MainApplication.kt`):**
```kotlin
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
// ... other imports

class MainApplication : Application(), ReactApplication {
    override fun onCreate() {
        super.onCreate()
        
        // Create default notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "swapjoy_default_channel",
                "SwapJoy Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for SwapJoy app"
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
        
        // ... rest of initialization
    }
}
```

### 4.6 Create Notification Resources (Optional but Recommended)

Create notification icon and color resources:

1. **Create notification icon** (`android/app/src/main/res/drawable/ic_notification.xml`):
   ```xml
   <vector xmlns:android="http://schemas.android.com/apk/res/android"
       android:width="24dp"
       android:height="24dp"
       android:viewportWidth="24"
       android:viewportHeight="24">
       <path
           android:fillColor="#FFFFFF"
           android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM13,17h-2v-6h2v6zM13,9h-2L11,7h2v2z"/>
   </vector>
   ```

2. **Create notification color** (`android/app/src/main/res/values/colors.xml`):
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <color name="notification_color">#FF6B35</color>
   </resources>
   ```

## Step 5: Build and Test

### iOS

```bash
npx expo run:ios
```

Or build with Xcode:
1. Open `ios/SwapJoy.xcworkspace` (or `.xcodeproj` if using SPM without workspace)
2. Select a device/simulator
3. Click **Run**

**Note:** For push notifications, you **must** test on a physical iOS device. Simulators don't support push notifications.

### Android

```bash
npx expo run:android
```

Or build with Android Studio:
1. Open `android/` folder in Android Studio
2. Sync Gradle files
3. Run the app

## Step 6: Verify Setup

After running the app:

1. **Sign in to the app** - device should automatically register
2. **Check console logs** for:
   - "Device registered successfully"
   - FCM token should be logged
3. **Check Supabase database:**
   - Query the `devices` table
   - Verify your device is registered with an FCM token

## Troubleshooting

### iOS: "No APNs token" or Push Notifications Not Working

- ✅ Ensure Push Notifications capability is enabled in Xcode
- ✅ Verify APNs certificates are configured in Apple Developer Portal
- ✅ **Must test on a physical device** (simulators don't support push)
- ✅ Check that `GoogleService-Info.plist` is in the correct location and added to target
- ✅ Verify Firebase packages are properly linked in Xcode

### iOS: "FirebaseApp not configured" Error

- ✅ Ensure `GoogleService-Info.plist` is in the project root and added to target
- ✅ Check that Firebase packages are added via SPM
- ✅ Verify React Native Firebase is properly linked

### Android: "google-services.json not found"

- ✅ Verify the file is at `android/app/google-services.json`
- ✅ Ensure the Google Services plugin is applied in `android/app/build.gradle`
- ✅ Run `cd android && ./gradlew clean && cd ..`

### Android: Build Errors with Firebase

- ✅ Ensure you're using the latest `google-services` plugin version (4.4.0+)
- ✅ Check that `com.google.gms.google-services` plugin is applied
- ✅ Verify `google-services.json` matches your package name
- ✅ Try cleaning the build: `cd android && ./gradlew clean`

### Token not generated

- ✅ Check notification permissions are granted (Android 13+)
- ✅ Verify Firebase project configuration matches in both `GoogleService-Info.plist` and `google-services.json`
- ✅ Check console logs for specific error messages
- ✅ Ensure app is properly signed (iOS requires proper provisioning profile)

### React Native Firebase Not Linking

- ✅ Verify packages are installed: `npm list @react-native-firebase/app @react-native-firebase/messaging`
- ✅ Run `npx expo prebuild --clean` to regenerate native folders
- ✅ Check that `@react-native-firebase/app` plugin is in `app.json`
- ✅ For iOS, manually verify linking in Xcode Build Phases

## Next Steps

Once setup is complete:
1. Device registration happens automatically on sign-in (via `DeviceService`)
2. Push notifications will be sent when rows are inserted into the `notifications` table
3. Test by using the test buttons in `DevRecommendationSettingsScreen`
4. Verify notifications appear and deep linking works correctly

## Additional Resources

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase iOS SDK Documentation](https://firebase.google.com/docs/ios/setup)
- [Firebase Android SDK Documentation](https://firebase.google.com/docs/android/setup)
- [Swift Package Manager Documentation](https://www.swift.org/package-manager/)
- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
