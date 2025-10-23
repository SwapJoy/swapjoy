# Firebase Phone Auth Setup for SwapJoy

## 🔥 **Firebase Configuration Steps:**

### **1. Create Firebase Project:**

1. **Go to:** [Firebase Console](https://console.firebase.google.com/)
2. **Click "Create a project"**
3. **Enter project name:** "SwapJoy"
4. **Enable Google Analytics** (optional)
5. **Click "Create project"**

### **2. Enable Phone Authentication:**

1. **In Firebase Console:**
   - Go to **Authentication** → **Sign-in method**
   - Click on **Phone** provider
   - **Toggle "Enable"** to ON
   - Click **Save**

### **3. Get Firebase Configuration:**

1. **Go to Project Settings:**
   - Click the gear icon → **Project settings**
   - Scroll down to **"Your apps"** section
   - Click **"Add app"** → **Web app** (</> icon)
   - Enter app nickname: "SwapJoy Mobile"
   - **Copy the config object**

2. **Update `config/firebase.ts`:**
   ```typescript
   export const FIREBASE_CONFIG = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

### **4. Configure Firebase for React Native:**

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project:**
   ```bash
   firebase init
   ```

### **5. iOS Configuration:**

1. **Download `GoogleService-Info.plist`:**
   - In Firebase Console → Project Settings → iOS app
   - Download the `GoogleService-Info.plist` file
   - Add it to your iOS project

2. **Update `ios/SwapJoy/AppDelegate.mm`:**
   ```objc
   #import <Firebase.h>
   
   - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
     [FIRApp configure];
     // ... existing code
   }
   ```

### **6. Android Configuration:**

1. **Download `google-services.json`:**
   - In Firebase Console → Project Settings → Android app
   - Download the `google-services.json` file
   - Add it to `android/app/` directory

2. **Update `android/build.gradle`:**
   ```gradle
   dependencies {
     classpath 'com.google.gms:google-services:4.3.15'
   }
   ```

3. **Update `android/app/build.gradle`:**
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### **7. Test Phone Authentication:**

1. **Run the app:**
   ```bash
   npm run ios
   ```

2. **Test with Georgian phone number:**
   - Enter: `+995123456789`
   - Click "Send OTP"
   - Check your phone for SMS
   - Enter the OTP code

### **8. Troubleshooting:**

- **SMS not received:** Check Firebase Console → Authentication → Users
- **Configuration errors:** Verify Firebase config in `config/firebase.ts`
- **Build errors:** Make sure all Firebase files are properly added

### **9. Firebase Console Features:**

- **Authentication → Users:** See all verified users
- **Authentication → Sign-in method:** Configure phone settings
- **Project Settings:** Manage app configurations

## 🎯 **How It Works:**

1. **User enters phone number** → Firebase sends OTP
2. **User enters OTP** → Firebase verifies and creates session
3. **App syncs user to Supabase** → User data stored in your database
4. **User is signed in** → Can use all SwapJoy features

## 📱 **Phone Number Format:**

- **Georgian numbers:** `+995123456789`
- **International format required**
- **No spaces or special characters**

Your Firebase Phone Auth is now ready for Georgian phone numbers! 🚀
