# Email & Google Sign-In Setup Guide

This guide covers the manual configuration steps needed to complete the email and Google sign-in setup.

## Prerequisites

- ✅ Code implementation is complete
- ⚠️ The following manual steps need to be completed

## 1. Supabase Configuration

### Enable Email/Password Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider and enable it
4. Configure email settings:
   - **Enable email confirmations**: Toggle based on your preference (recommended: ON for production)
   - **Secure email change**: Enable if you want users to confirm email changes
   - **Allow sign ups**: Enable to allow new user registrations

### Enable Google OAuth Provider

1. In **Authentication** → **Providers**, find **Google** provider
2. Enable the Google provider
3. You'll need to add:
   - **Client ID (for OAuth)**: This will come from Google Cloud Console (see section 2)
   - **Client Secret (for OAuth)**: Also from Google Cloud Console

### Configure Redirect URLs

1. In **Authentication** → **URL Configuration**, add the following redirect URLs:
   - `com.swapjoy://auth/callback`
   - `swapjoy://auth/callback`
   - These are the deep link URLs that Supabase will redirect to after OAuth authentication

## 2. Google Cloud Console Setup

### Create a New Project (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** for your project

### Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required information:
   - App name: `SwapJoy`
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Save and continue

### Create OAuth 2.0 Client IDs

#### For iOS

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **iOS** as the application type
4. Enter:
   - **Name**: `SwapJoy iOS`
   - **Bundle ID**: `com.swapjoy` (or your actual bundle ID)
5. Click **Create**
6. Copy the **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

#### For Android

1. Click **Create Credentials** → **OAuth 2.0 Client ID** again
2. Select **Android** as the application type
3. Enter:
   - **Name**: `SwapJoy Android`
   - **Package name**: `com.swapjoy` (or your actual package name from `android/app/build.gradle`)
   - **SHA-1 certificate fingerprint**: 
     - For debug: Get it by running:
       ```bash
       cd android/app
       keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
       ```
     - Copy the SHA-1 value (looks like: `AA:BB:CC:DD:EE:FF:...`)
     - For production, use your production keystore
4. Click **Create**
5. Copy the **Client ID**

#### For Web (needed for Supabase)

1. Click **Create Credentials** → **OAuth 2.0 Client ID** again
2. Select **Web application** as the application type
3. Enter:
   - **Name**: `SwapJoy Web`
   - **Authorized redirect URIs**: 
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - Replace `YOUR_PROJECT_REF` with your Supabase project reference
4. Click **Create**
5. Copy the **Client ID** and **Client Secret**

### Update Supabase with Google Credentials

1. Go back to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste the **Client ID (for OAuth)** from the Web application
3. Paste the **Client Secret (for OAuth)** from the Web application
4. Save

## 3. Update Native Configuration Files

### iOS Configuration

1. Open `ios/SwapJoy/Info.plist`
2. Find the `GIDClientID` key and replace `YOUR_GOOGLE_CLIENT_ID` with your iOS Client ID
3. In the `CFBundleURLSchemes` array, add your reversed client ID:
   ```xml
   <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
   ```
   - Replace `YOUR_CLIENT_ID` with the iOS Client ID you got from Google Cloud Console
   - Example: If your Client ID is `123456789-abc.apps.googleusercontent.com`, the reversed ID would be `com.googleusercontent.apps.123456789-abc`

### Android Configuration

1. Open `android/app/src/main/AndroidManifest.xml`
2. Find the `com.google.android.gms.auth.api.signin.client_id` meta-data
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your Android Client ID

### Environment Variables

1. Create or update your `.env` file (or environment variables):
   ```bash
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here
   ```
   - Use the Web application Client ID from Google Cloud Console
   - This is used by the `@react-native-google-signin/google-signin` package

## 4. Install Native Dependencies

### iOS

1. Navigate to the iOS directory:
   ```bash
   cd ios
   ```
2. Install pods (if using CocoaPods):
   ```bash
   pod install
   ```
   Or if using SPM, the package should auto-link.

### Android

1. The Google Sign-In dependency should auto-link via React Native's autolinking
2. If not, rebuild the project:
   ```bash
   cd android
   ./gradlew clean
   ```

## 5. Testing

### Test Email Sign-In

1. Run the app
2. Navigate to sign-in screen
3. Click "Sign in with Email" or navigate to Email Sign-In
4. Test sign-up with a new email
5. Test sign-in with existing credentials

### Test Google Sign-In

1. Run the app on a device or emulator
2. Navigate to sign-in screen
3. Click "Continue with Google"
4. Complete the Google sign-in flow
5. Verify user is created in Supabase dashboard

### Verify Deep Linking

1. Test that OAuth redirects work correctly
2. The app should handle `com.swapjoy://auth/callback` URLs

## Troubleshooting

### Google Sign-In Not Working

- **iOS**: Verify the REVERSED_CLIENT_ID is correctly added to Info.plist
- **Android**: Verify the Client ID is in AndroidManifest.xml
- Check that the SHA-1 fingerprint matches in Google Cloud Console
- Ensure Google Play Services are up to date on the device

### Email Confirmation Issues

- If email confirmation is enabled, users may need to verify email before signing in
- Check Supabase email settings in Authentication → Email Templates

### Deep Linking Issues

- Verify URL schemes are correctly configured in both iOS and Android
- Test deep links manually: `adb shell am start -W -a android.intent.action.VIEW -d "com.swapjoy://auth/callback" com.swapjoy` (Android)

## Notes

- The Google Sign-In SDK uses native authentication, then exchanges the ID token with Supabase
- Email/password authentication uses Supabase's built-in provider
- All authentication methods create/update users in the `public.users` table automatically
- Session persistence works across all auth methods via SecureStore





