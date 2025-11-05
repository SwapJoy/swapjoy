// NOTE: This file is for web Firebase SDK, but React Native should use @react-native-firebase instead
// The web Firebase SDK (firebase package) doesn't work well in React Native environment
// This app uses:
// - Supabase for authentication (not Firebase Auth)
// - @react-native-firebase/messaging for push notifications (not web Firebase SDK)

import { Platform } from 'react-native';

// React Native platform - completely disable web Firebase SDK
// Metro bundler might try to resolve require() statements even in conditionals
// So we completely avoid importing Firebase web SDK on React Native
if (Platform.OS !== 'web') {
  // React Native platform - export stub functions
  export const getAuth = () => {
    throw new Error('Firebase web SDK is not available in React Native. Use Supabase for auth or @react-native-firebase for native features.');
  };
  
  export const PhoneAuthProvider = null;
  
  export const getFirebaseApp = () => {
    throw new Error('Firebase web SDK is not available in React Native. Use @react-native-firebase instead.');
  };
  
  export default null;
} else {
  // Web platform - dynamically import Firebase only when needed
  // Using dynamic import to prevent Metro from trying to resolve it on React Native
  let firebaseAppModule: any = null;
  let firebaseAuthModule: any = null;
  let firebaseConfig: any = null;
  let app: any = null;
  let auth: any = null;

  const loadFirebase = async () => {
    if (firebaseAppModule && firebaseAuthModule) {
      return { firebaseApp: firebaseAppModule, firebaseAuth: firebaseAuthModule };
    }

    firebaseAppModule = await import('firebase/app');
    firebaseAuthModule = await import('firebase/auth');
    firebaseConfig = await import('../config/firebase');
    
    return { firebaseApp: firebaseAppModule, firebaseAuth: firebaseAuthModule };
  };

  export const getFirebaseApp = async () => {
    if (app) return app;
    
    const { firebaseApp } = await loadFirebase();
    
    if (firebaseApp.getApps().length === 0) {
      app = firebaseApp.initializeApp(firebaseConfig.FIREBASE_CONFIG);
    } else {
      app = firebaseApp.getApp();
    }
    
    return app;
  };

  export const getAuth = async () => {
    if (auth) return auth;
    
    const { firebaseAuth } = await loadFirebase();
    const firebaseApp = await getFirebaseApp();
    auth = firebaseAuth.getAuth(firebaseApp);
    
    return auth;
  };

  export const PhoneAuthProvider = null; // Will be set dynamically when needed
  
  export default null;
}
