import { initializeApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../config/firebase';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Auth
const auth = getAuth(app);

// Debug: Log Firebase initialization
console.log('Firebase initialized with config:', {
  projectId: FIREBASE_CONFIG.projectId,
  authDomain: FIREBASE_CONFIG.authDomain,
  apiKey: FIREBASE_CONFIG.apiKey.substring(0, 10) + '...'
});

export { auth, PhoneAuthProvider };
export default app;
