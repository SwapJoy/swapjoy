#!/bin/bash

# Fix CocoaPods ffi_c error
# Run this script in your terminal: bash fix_pods.sh

echo "🔧 Fixing CocoaPods ffi_c error..."
echo ""

# Rebuild ffi gem with proper extensions
echo "Rebuilding ffi gem..."
ARCHFLAGS="-arch arm64" sudo gem pristine ffi --version 1.17.2

# Also rebuild json gem if needed
echo ""
echo "Rebuilding json gem..."
ARCHFLAGS="-arch arm64" sudo gem pristine json --version 2.6.1 2>/dev/null || echo "Skipping json (may not be needed)"

echo ""
echo "✅ Gems rebuilt! Now running pod install..."
echo ""

# Run pod install
pod install

echo ""
echo "✅ Done! If pod install succeeded, you can now run: npx expo run:ios"



