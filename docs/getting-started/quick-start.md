# Quick Start Guide

## Prerequisites

### Required Software
- **Node.js**: v20.x LTS or higher
- **npm**: v10.x or higher
- **Git**: Latest version
- **React Native CLI**: Latest version
- **Xcode**: 15+ (for iOS development, macOS only)
- **Android Studio**: Latest version (for Android development)
- **Supabase CLI**: Latest version

### Accounts Needed
- Supabase account (free tier)
- Apple Developer Account (for iOS, $99/year)
- Google Play Developer Account (for Android, $25 one-time)
- Firebase account (for push notifications)

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/swapjoy.git
cd swapjoy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

#### Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in project details:
   - Name: SwapJoy
   - Database Password: (save this securely)
   - Region: Choose closest to your users
   - Pricing Plan: Free (for development)

#### Get Project Credentials
From your Supabase project dashboard:
1. Go to Settings → API
2. Copy:
   - Project URL
   - Anon (public) key
   - Service role key (keep secret!)

#### Install Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

#### Link to Your Project
```bash
supabase login
supabase link --project-ref your-project-ref
```

### 4. Configure Authentication Providers

#### Email/Password (Already enabled by default)
No additional setup needed!

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to Supabase:
   - Dashboard → Authentication → Providers → Google
   - Enable Google provider
   - Add Client ID and Client Secret
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Get App ID and App Secret
5. Add to Supabase:
   - Dashboard → Authentication → Providers → Facebook
   - Enable Facebook provider
   - Add App ID and App Secret
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

#### Apple Sign In (iOS)
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create App ID with Sign In with Apple capability
3. Create Service ID
4. Create Private Key
5. Add to Supabase:
   - Dashboard → Authentication → Providers → Apple
   - Enable Apple provider
   - Add Service ID and Private Key

### 5. Environment Variables

Create `.env` file in project root:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OAuth (for mobile deep linking)
GOOGLE_WEB_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id
APPLE_SERVICE_ID=your-apple-service-id

# Firebase (for push notifications)
FIREBASE_SERVER_KEY=your-firebase-server-key

# App Configuration
APP_ENV=development
API_URL=https://your-project.supabase.co
```

Create `.env.example` (for repository):
```bash
# Copy this file to .env and fill in your values
SUPABASE_URL=
SUPABASE_ANON_KEY=
# ... etc
```

### 6. Set Up Database Schema

#### Run Migrations
```bash
# Apply database migrations
supabase db push

# Or if you have SQL files
psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql
```

#### Seed Initial Data
```bash
# Run seed script
npm run db:seed

# Or manually in Supabase SQL Editor
# Categories, initial data, etc.
```

### 7. Mobile App Setup

#### iOS Setup
```bash
cd ios
pod install
cd ..
```

**Configure Info.plist:**
```xml
<!-- URL Schemes for OAuth -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>swapjoy</string>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
      <string>fbYOUR_FACEBOOK_APP_ID</string>
    </array>
  </dict>
</array>

<!-- Permissions -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby items</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to upload item images</string>
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos of items</string>
```

#### Android Setup

**Configure AndroidManifest.xml:**
```xml
<!-- Permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- Deep linking -->
<activity>
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="swapjoy" />
  </intent-filter>
</activity>
```

### 8. Firebase Setup (Push Notifications)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Add iOS app
   - Bundle ID: com.swapjoy.app
   - Download GoogleService-Info.plist
   - Add to ios/ folder
4. Add Android app
   - Package name: com.swapjoy
   - Download google-services.json
   - Add to android/app/ folder
5. Enable Cloud Messaging
6. Get Server Key from Project Settings → Cloud Messaging

## Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on iOS
```bash
# Run on iOS Simulator
npm run ios

# Run on specific simulator
npm run ios -- --simulator="iPhone 15 Pro"

# Run on physical device (requires Apple Developer account)
npm run ios -- --device
```

### Run on Android
```bash
# Run on Android Emulator
npm run android

# Run on physical device (USB debugging enabled)
npm run android
```

## Development Workflow

### 1. Start Supabase Locally (Optional)
```bash
supabase start
```

### 2. Make Changes
- Edit code in your favorite editor (VS Code recommended)
- Hot reload will update the app automatically

### 3. Test Changes
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### 4. Check Code Quality
```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

### 5. Commit Changes
```bash
git add .
git commit -m "Description of changes"
git push
```

## Common Commands

```bash
# Install new dependency
npm install <package-name>

# iOS - Clean build
cd ios && pod install && cd ..
npm run ios -- --reset-cache

# Android - Clean build
cd android && ./gradlew clean && cd ..
npm run android

# Reset React Native cache
npm start -- --reset-cache

# Generate TypeScript types from Supabase
npm run generate:types

# Database migrations
supabase migration new <migration_name>
supabase db push

# View Supabase logs
supabase functions logs <function-name>
```

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache

# Or manually
rm -rf node_modules
npm install
```

### iOS Build Issues
```bash
# Clean Pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Clean Xcode build
# Open ios/SwapJoy.xcworkspace in Xcode
# Product → Clean Build Folder
```

### Android Build Issues
```bash
# Clean Gradle
cd android
./gradlew clean
cd ..

# Clear Gradle cache
rm -rf ~/.gradle/caches/
```

### Supabase Connection Issues
- Check your `.env` file has correct values
- Verify network connection
- Check Supabase dashboard for project status
- Check API logs in Supabase dashboard

## Next Steps

1. ✅ Set up development environment
2. ✅ Run the app locally
3. 📖 Read [Architecture Documentation](../architecture/system-architecture.md)
4. 📖 Read [Database Schema](../data-models/database-schema.md)
5. 🏗️ Start building features
6. 🧪 Write tests
7. 🚀 Deploy to staging

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- Check the [FAQ](./faq.md)
- Search existing issues on GitHub
- Ask in team Slack channel
- Create a new issue on GitHub

