/**
 * Firebase Configuration
 * Initialize Firebase only once - single source of truth
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBhVllTeHyAJoUTmQjFQyG8DMFW-csGqsA",
  authDomain: "storyverse-830fc.firebaseapp.com",
  projectId: "storyverse-830fc",
  storageBucket: "storyverse-830fc.firebasestorage.app",
  messagingSenderId: "55968683388",
  appId: "1:55968683388:web:67886fee495e39504a40f9",
  measurementId: "G-3JBD3EYPG1"
};

// Initialize Firebase (only once)
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
