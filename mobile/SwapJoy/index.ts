// IMPORTANT: Import React Native Firebase modules at the entry point
// This ensures the native modules are registered with the React Native bridge
// BEFORE any other code tries to use them
import firebase from '@react-native-firebase/app';
// Explicitly import messaging to ensure it's registered with the bridge
import messaging from '@react-native-firebase/messaging';
import { FIREBASE_CONFIG } from './config/firebase';

console.log('📦 React Native Firebase modules loaded at entry point');
console.log('📦 firebase module:', typeof firebase);
console.log('📦 messaging module:', typeof messaging);

// Force module registration by accessing NativeModules
import { NativeModules } from 'react-native';

/**
 * Initialize Firebase in JavaScript
 * Even though native Firebase is initialized in AppDelegate.swift,
 * React Native Firebase v19 may require explicit initialization in JavaScript
 * to properly bridge to the native instance.
 */
const initializeFirebase = async (): Promise<boolean> => {
  // Wait for native modules to be registered first
  await waitForNativeModules();

  // Try to initialize Firebase explicitly
  // This will work even if native Firebase is already initialized
  // React Native Firebase will use the existing native instance
  try {
    // Check if Firebase apps already exist
    const existingApps = firebase.apps;
    if (existingApps && existingApps.length > 0) {
      console.log(`ℹ️ Firebase apps already exist (${existingApps.length}), trying to access...`);
      try {
        const app = firebase.app();
        console.log(`✅ Firebase app accessible: ${app.name}`);
        return true;
      } catch (error: any) {
        console.log('⚠️ Apps exist but not accessible yet, will try explicit initialization');
      }
    }

    // Try to explicitly initialize Firebase
    // This will either:
    // 1. Create a new app if none exists
    // 2. Use the existing native app if one exists
    // 3. Throw an error if already initialized (which we'll catch)
    firebase.initializeApp(FIREBASE_CONFIG);
    const app = firebase.app();
    console.log(`✅ Firebase initialized successfully: ${app.name}`);
    return true;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    
    // If Firebase is already initialized, try to access it
    if (
      errorMsg.includes('already exists') ||
      errorMsg.includes('already initialized') ||
      errorMsg.includes('Firebase App')
    ) {
      console.log('ℹ️ Firebase already initialized, trying to access existing app...');
      try {
        const app = firebase.app();
        console.log(`✅ Firebase app accessible: ${app.name}`);
        return true;
      } catch (appError: any) {
        console.error('❌ Failed to access Firebase app:', appError?.message);
        return false;
      }
    }
    
    // If it's just the initializeApp method not being available, that's okay
    // because native Firebase is already initialized and we can access it directly
    if (errorMsg.includes('initializeApp') && errorMsg.includes('not a function')) {
      console.log('ℹ️ initializeApp() not available (native Firebase already initialized)');
      // Try to access the existing app
      try {
        const app = firebase.app();
        console.log(`✅ Firebase app accessible: ${app.name}`);
        return true;
      } catch (appError: any) {
        console.error('❌ Failed to access Firebase app:', appError?.message);
        return false;
      }
    }
    
    console.error('❌ Failed to initialize Firebase:', errorMsg);
    return false;
  }
};

/**
 * Wait for Firebase bridge to be ready
 */
const waitForFirebaseBridge = async (maxRetries = 60, delayMs = 200): Promise<boolean> => {
  // First, try to initialize Firebase
  const initialized = await initializeFirebase();
  if (!initialized) {
    console.warn('⚠️ Explicit initialization failed, waiting for bridge...');
  }

  // Now wait for Firebase bridge to be ready
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try to access the default Firebase app
      const defaultApp = firebase.app();
      console.log(`✅ Firebase bridge ready: ${defaultApp.name} (attempt ${i + 1})`);
      
      // Verify messaging is accessible
      try {
        const messagingInstance = messaging();
        if (messagingInstance) {
          console.log('✅ Firebase messaging accessible');
          return true;
        }
      } catch (messagingError: any) {
        // If app() works, the bridge is ready even if messaging has issues
        console.log('✅ Firebase bridge ready (messaging may have separate issues)');
        return true;
      }
      
      return true;
    } catch (error: any) {
      // Bridge not ready yet
      if (i < maxRetries - 1) {
        if (i === 0 || i % 10 === 0 || i === maxRetries - 1) {
          const errorMsg = error?.message || String(error);
          console.log(`⏳ Waiting for Firebase bridge... (attempt ${i + 1}/${maxRetries})`);
          if (errorMsg.includes('Firebase App') || errorMsg.includes('initializeApp')) {
            console.log('   → Bridge not ready yet, waiting...');
          }
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // Last attempt failed
        console.error('❌ Firebase bridge not ready after all attempts:', error?.message);
        return false;
      }
    }
  }
  
  return false;
};

/**
 * Wait for native modules to be registered
 */
const waitForNativeModules = async (maxRetries = 50, delayMs = 100): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    if (NativeModules.RNFBAppModule || NativeModules.RNFBApp) {
      const moduleName = NativeModules.RNFBAppModule ? 'RNFBAppModule' : 'RNFBApp';
      console.log(`✅ ${moduleName} native module registered (attempt ${i + 1})`);
      return true;
    }
    if (i < maxRetries - 1) {
      if (i === 0 || i % 10 === 0) {
        console.log(`⏳ Waiting for RNFBApp native module... (attempt ${i + 1}/${maxRetries})`);
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  console.error('❌ RNFBApp native module not found after all attempts');
  return false;
};

// Wait for Firebase bridge to be ready
// This ensures Firebase is accessible before the app tries to use it
let firebaseReady = false;

const waitForFirebase = async () => {
  if (firebaseReady) return;
  
  const success = await waitForFirebaseBridge();
  if (success) {
    firebaseReady = true;
    console.log('✅ Firebase bridge ready - Firebase is now accessible');
  } else {
    console.error('❌ Firebase bridge not ready - Firebase may not work properly');
    console.error('   This might indicate:');
    console.error('   1. Native Firebase modules not properly linked');
    console.error('   2. React Native bridge timing issue');
    console.error('   3. GoogleService-Info.plist bundle ID mismatch');
    console.error('   Try: Restart the app or rebuild the native project');
  }
};

// Start waiting for Firebase bridge after a short delay
// This ensures native modules have time to register
setTimeout(() => {
  waitForFirebase();
}, 500);

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
