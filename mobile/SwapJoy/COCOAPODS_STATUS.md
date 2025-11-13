# CocoaPods Setup Status

## ✅ Completed

1. **Fixed ffi gem issue**: Installed ffi 1.17.2 in user directory (`~/.gem`)
2. **Downgraded React Native Firebase**: Changed from 20.5.0 to 19.2.0
   - React Native Firebase 19.2.0 requires Firebase iOS SDK 10.24.0 (available in CocoaPods)
   - React Native Firebase 20.5.0 requires Firebase iOS SDK 10.29.0 (not yet available)
3. **Added CDN repo**: Added CocoaPods trunk CDN for faster spec access
4. **Podfile updated**: Removed duplicate Firebase pod (handled by React Native Firebase)

## ⚠️ Current Issue

CocoaPods is encountering an ActiveSupport compatibility issue with the system Ruby (2.6.10). The error:

```
uninitialized constant ActiveSupport::LoggerThreadSafeLevel::Logger (NameError)
```

This occurs because:
- System Ruby 2.6.10 is being used
- CocoaPods 1.16.2 requires Ruby 3.1+ but is trying to use system gems
- ActiveSupport version mismatch between system and user-installed gems

## 🔧 Solutions

### Option 1: Use Homebrew Ruby (Recommended)

1. **Add Homebrew Ruby to PATH** (add to `~/.zshrc`):
   ```bash
   export PATH="/usr/local/opt/ruby/bin:/usr/local/lib/ruby/gems/3.4.0/bin:$PATH"
   ```

2. **Install CocoaPods with Homebrew Ruby**:
   ```bash
   export PATH="/usr/local/opt/ruby/bin:/usr/local/lib/ruby/gems/3.4.0/bin:$PATH"
   gem install cocoapods
   ```

3. **Run pod install**:
   ```bash
   cd mobile/SwapJoy/ios
   export PATH="/usr/local/opt/ruby/bin:/usr/local/lib/ruby/gems/3.4.0/bin:$PATH"
   pod install
   ```

### Option 2: Fix ActiveSupport Compatibility

Install a compatible ActiveSupport version for Ruby 2.6:

```bash
sudo gem install activesupport -v 6.0.0
```

Then try:
```bash
cd mobile/SwapJoy/ios
pod install
```

### Option 3: Use Bundler (Project-specific gems)

1. **Create `ios/Gemfile`**:
   ```ruby
   source 'https://rubygems.org'
   gem 'cocoapods', '1.16.2'
   ```

2. **Install and use**:
   ```bash
   cd mobile/SwapJoy/ios
   bundle install
   bundle exec pod install
   ```

## 📝 Next Steps After Pod Install

Once `pod install` succeeds:

1. Open Xcode workspace: `open ios/SwapJoy.xcworkspace`
2. Add `GoogleService-Info.plist` to Xcode project (if not already added)
3. Enable Push Notifications capability in Xcode
4. Configure APNs certificates in Apple Developer Portal
5. Test on physical device

See `MANUAL_SETUP_STEPS.md` for detailed instructions.





