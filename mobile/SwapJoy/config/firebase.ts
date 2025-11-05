// Firebase Configuration
// Note: When native Firebase is already initialized (via FirebaseApp.configure() in AppDelegate.swift),
// React Native Firebase should automatically detect it without needing this config.
// This config is only used as a fallback if native Firebase isn't initialized.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCRVdZS2BLbLiIgvVPTbSW4AOTxtbudM-8",
  authDomain: "swapjoy-b8855.firebaseapp.com",
  projectId: "swapjoy-b8855",
  storageBucket: "swapjoy-b8855.firebasestorage.app",
  messagingSenderId: "96140617553",
  appId: "1:96140617553:ios:a6753d2fcbd66126af1570",
  // databaseURL is optional - only needed if using Firebase Realtime Database
  // We're not using Realtime Database, so we can omit it or set it to empty string
  databaseURL: "" // Optional: empty string for apps not using Realtime Database
};
