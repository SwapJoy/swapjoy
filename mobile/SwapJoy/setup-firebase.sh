#!/bin/bash

# Firebase Setup Script for SwapJoy
# This script copies Firebase configuration files to the native iOS and Android projects

set -e

echo "🔥 Setting up Firebase configuration files..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$SCRIPT_DIR/config"
IOS_DIR="$SCRIPT_DIR/ios/SwapJoy"
ANDROID_APP_DIR="$SCRIPT_DIR/android/app"

# Check if config files exist
if [ ! -f "$CONFIG_DIR/GoogleService-Info.plist" ]; then
    echo "❌ Error: GoogleService-Info.plist not found at $CONFIG_DIR/GoogleService-Info.plist"
    exit 1
fi

if [ ! -f "$CONFIG_DIR/google-services.json" ]; then
    echo "❌ Error: google-services.json not found at $CONFIG_DIR/google-services.json"
    exit 1
fi

# Copy iOS config
if [ -d "$IOS_DIR" ]; then
    echo "📱 Copying GoogleService-Info.plist to iOS project..."
    cp "$CONFIG_DIR/GoogleService-Info.plist" "$IOS_DIR/GoogleService-Info.plist"
    echo "✅ iOS config copied successfully"
else
    echo "⚠️  iOS directory not found. Run 'npx expo prebuild' first."
fi

# Copy Android config
if [ -d "$ANDROID_APP_DIR" ]; then
    echo "🤖 Copying google-services.json to Android project..."
    cp "$CONFIG_DIR/google-services.json" "$ANDROID_APP_DIR/google-services.json"
    echo "✅ Android config copied successfully"
else
    echo "⚠️  Android directory not found. Run 'npx expo prebuild' first."
fi

echo ""
echo "✅ Firebase setup complete!"
echo ""
echo "Next steps:"
echo "1. For iOS: Open Xcode and add GoogleService-Info.plist to your project"
echo "2. For Android: Verify google-services.json is in android/app/"
echo "3. Follow the instructions in NATIVE_FIREBASE_SETUP.md"






