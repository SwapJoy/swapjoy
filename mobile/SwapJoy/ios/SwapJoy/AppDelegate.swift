import Expo
import React
import ReactAppDependencyProvider
import FirebaseCore
import GoogleSignIn

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // CRITICAL: Initialize Firebase BEFORE React Native starts
    // This must happen before the bridge is created
    FirebaseApp.configure()
    
    // Verify Firebase was initialized
    if let defaultApp = FirebaseApp.app() {
      print("✅ Firebase initialized successfully: \(defaultApp.name)")
      print("   Bundle ID: \(defaultApp.options.bundleID ?? "unknown")")
    } else {
      print("❌ ERROR: Firebase initialization failed - FirebaseApp.app() is nil")
    }
    
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    print("[Linking] application:openURL:options: URL=\(url.absoluteString)")
    // Handle Google Sign-In URL
    if GIDSignIn.sharedInstance.handle(url) {
      print("[Linking] GoogleSignIn handled URL")
      return true
    } else {
      print("[Linking] GoogleSignIn did not handle URL")
    }
    let rnHandled = RCTLinkingManager.application(app, open: url, options: options)
    let superHandled = super.application(app, open: url, options: options)
    print("[Linking] RCTLinkingManager handled: \(rnHandled), super handled: \(superHandled)")
    return superHandled || rnHandled
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
