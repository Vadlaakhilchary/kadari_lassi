/**
 * Firebase Configuration & Initialization
 * 
 * This module initializes Firebase with the modular SDK and exports
 * key services for use throughout the application.
 * 
 * Replace placeholder config values with your actual Firebase project credentials.
 */

// ========================
// FIREBASE MODULAR SDK IMPORTS
// ========================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
  getFirestore,
  enableIndexedDbPersistence 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { 
  getAuth,
  setPersistence,
  browserLocalPersistence 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

// ========================
// FIREBASE PROJECT CONFIGURATION
// ========================
// TODO: Replace with your Firebase project credentials
// Get these from: Firebase Console > Project Settings
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4ND-7QY8EdBTcTFmYBiGBduITNwrzhHI",
  authDomain: "kadari-lassi.firebaseapp.com",
  projectId: "kadari-lassi",
  storageBucket: "kadari-lassi.firebasestorage.app",
  messagingSenderId: "84105940653",
  appId: "1:84105940653:web:a22deaf376dc28bf760024",
  measurementId: "G-X80BH2MSJN"
};

// ========================
// FIREBASE INITIALIZATION
// ========================
let db = null;
let auth = null;
let initialized = false;

try {
  // Initialize Firebase App
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');

  // Initialize Firestore Database
  db = getFirestore(app);
  
  // Enable offline persistence for better UX
  // This allows the app to work offline and sync when back online
  try {
    enableIndexedDbPersistence(db);
    console.log('✅ Firestore offline persistence enabled');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open. Offline persistence disabled.');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser does not support offline persistence');
    }
  }

  // Initialize Authentication
  auth = getAuth(app);
  
  // Set persistent authentication (user stays logged in across sessions)
  setPersistence(auth, browserLocalPersistence)
    .catch(err => console.error('⚠️ Could not set auth persistence:', err));
  
  initialized = true;
  console.log('✅ Firebase auth initialized with persistent sessions');

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('💡 Please ensure you have updated the Firebase config with your project credentials');
}

// ========================
// ERROR HANDLING
// ========================
if (!initialized) {
  console.error('🔴 CRITICAL: Firebase not properly initialized!');
  console.error('Check your firebaseConfig values and browser console for errors');
}

// ========================
// FIRESTORE SECURITY RULES (Reference)
// ========================
/*
  Recommended Firestore Security Rules:
  
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      
      // Allow anyone to read menu items
      match /menuItems/{document=**} {
        allow read: if true;
        allow create, update, delete: if request.auth != null;
      }
      
      // Restrict all other collections to authenticated users only
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  
  This ensures:
  - Public read access for menu (customers can see items)
  - Write access only for authenticated admins
*/

// ========================
// EXPORTS
// ========================
export { db, auth, initialized };
export { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
