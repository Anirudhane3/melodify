import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialise if all required keys are present
const _required = [
  import.meta.env.VITE_FIREBASE_API_KEY,
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  import.meta.env.VITE_FIREBASE_APP_ID,
];

const _configured = _required.every(
  v => v && v.trim() !== '' && !v.startsWith('your-')
);

let app     = null;
let db      = null;
let storage = null;
let auth    = null;

if (_configured) {
  try {
    app     = initializeApp(firebaseConfig);
    db      = getFirestore(app);
    storage = getStorage(app);
    auth    = getAuth(app);
  } catch (err) {
    console.warn('Firebase init failed:', err.message);
  }
}

export const googleProvider = new GoogleAuthProvider();
export { db, storage, auth };
export const isFirebaseConfigured = _configured && !!app;
