# CocoaPods Fix Guide

## Issue: Architecture Mismatch (ffi gem)

Your system has x86_64 versions of Ruby gems but needs arm64. Here's how to fix it:

## Solution 1: Reinstall ffi gem for arm64 (Recommended)

```bash
# Remove old ffi gem
sudo gem uninstall ffi -x

# Reinstall ffi for arm64
sudo arch -arm64 gem install ffi

# Try pod install again
cd ios
pod install
```

## Solution 2: Use Bundler (Alternative)

If Solution 1 doesn't work, use Bundler:

```bash
# Install bundler
gem install bundler

# Create Gemfile in ios directory
cd ios
cat > Gemfile << EOF
source 'https://rubygems.org'
gem 'cocoapods', '~> 1.16'
gem 'ffi', '~> 1.15'
EOF

# Install gems via bundler
bundle install

# Use bundle exec for pod commands
bundle exec pod install
```

## Solution 3: Use Homebrew Ruby (Best for Apple Silicon)

```bash
# Install Ruby via Homebrew
brew install ruby

# Add to your ~/.zshrc or ~/.bash_profile
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Install CocoaPods with Homebrew Ruby
gem install cocoapods

# Try pod install
cd ios
pod install
```

## After Fixing CocoaPods

Once `pod install` succeeds:

1. **Open the workspace** (not .xcodeproj):
   ```bash
   open ios/SwapJoy.xcworkspace
   ```

2. **Add Firebase via CocoaPods** - Edit `ios/Podfile` and add:
   ```ruby
   pod 'Firebase/Messaging'
   ```

3. **Run pod install again**:
   ```bash
   cd ios
   pod install
   ```

4. **Add GoogleService-Info.plist to Xcode**:
   - Right-click SwapJoy folder → Add Files to "SwapJoy"...
   - Select `ios/SwapJoy/GoogleService-Info.plist`
   - Check "Copy items if needed" and "Add to targets: SwapJoy"

5. **Enable Push Notifications**:
   - Select SwapJoy target → Signing & Capabilities
   - Click + Capability → Push Notifications
   - Click + Capability → Background Modes → Check "Remote notifications"

## Xcode Crash Issue

If Xcode is crashing for all projects, try:

1. **Reset Xcode preferences**:
   ```bash
   rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist
   rm -rf ~/Library/Application\ Support/Xcode
   ```

2. **Reinstall Xcode** (if needed)

3. **Check system logs**:
   ```bash
   log show --predicate 'process == "Xcode"' --last 5m
   ```

## Next Steps

Once CocoaPods is fixed and Xcode opens:

1. Build and test on simulator
2. Verify React Native modules are linked
3. Test Firebase setup
4. Configure APNs certificates for physical device testing

