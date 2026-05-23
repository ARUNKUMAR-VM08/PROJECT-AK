import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import logger from '../utils/logger';

const firebaseConfig = {
  apiKey: "AIzaSyDvW_icRWILabKlM9eY3V2nCAIKKQ34HtQ",
  authDomain: "iframeyouu-1ab25.firebaseapp.com",
  projectId: "iframeyouu-1ab25",
  storageBucket: "iframeyouu-1ab25.firebasestorage.app",
  messagingSenderId: "51796046311",
  appId: "1:51796046311:web:be10ba97c620222e268d42",
  measurementId: "G-0MF0WL8NB3"
};
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app, auth, db, googleProvider;

try {
  app            = initializeApp(firebaseConfig);
  auth           = getAuth(app);
  db             = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  logger.firebase('init', 'Firebase initialized successfully');
} catch (err) {
  logger.error('Firebase initialization failed:', err);
  // App continues in demo / offline mode with local seed data
}

export { auth, db, googleProvider };
export default app;
