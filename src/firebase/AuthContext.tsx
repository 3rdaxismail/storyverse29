/**
 * AuthContext - Global Firebase Auth State
 * Single source of truth for authentication
 * NEVER use localStorage for auth state
 */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  type User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { deviceSessionManager } from '../services/DeviceSessionManager';
import type { SessionStatus, SessionConflict } from '../services/DeviceSessionManager';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  createdAt: number | Date;
  profileCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  sessionStatus: SessionStatus;
  sessionConflict: SessionConflict | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('inactive');
  const [sessionConflict, setSessionConflict] = useState<SessionConflict | null>(null);

  const loadUserProfile = async (uid: string) => {
    try {
      console.log('[AuthContext] Loading user profile for UID:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        console.log('[AuthContext] Profile loaded:', profileData);
        setUserProfile(profileData);
      } else {
        console.log('[AuthContext] No profile document found');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  // Listen to Firebase Auth state changes (SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Load user profile from Firestore
        await loadUserProfile(firebaseUser.uid);
        
        // Initialize device session
        console.log('[AuthContext] Initializing device session for user:', firebaseUser.uid);
        deviceSessionManager.initializeSession(firebaseUser.uid, (status, conflict) => {
          console.log('[AuthContext] Session status changed:', status, conflict);
          setSessionStatus(status);
          setSessionConflict(conflict || null);
        });
      } else {
        // User logged out - cleanup session
        console.log('[AuthContext] User logged out, cleaning up session');
        deviceSessionManager.cleanup();
        setUserProfile(null);
        setSessionStatus('inactive');
        setSessionConflict(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserProfile = async () => {
    console.log('[AuthContext] refreshUserProfile called, user:', user?.uid);
    if (user) {
      // Force a fresh read from Firestore
      try {
        console.log('[AuthContext] Fetching latest profile from Firestore...');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          console.log('[AuthContext] Latest profile data:', profileData);
          // Force state update by creating new object reference
          setUserProfile({ ...profileData });
          console.log('[AuthContext] Profile state updated');
        }
      } catch (error) {
        console.error('[AuthContext] Error refreshing profile:', error);
      }
    }
  };

  // Sign up with Email/Password
  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // CRITICAL: Create user document on first signup
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: '',
      photoURL: null,
      bio: '',
      createdAt: serverTimestamp(),
      profileCompleted: false
    });
  };

  // Sign in with Email/Password
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        const newProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || '',
          photoURL: userCredential.user.photoURL,
          bio: '',
          createdAt: serverTimestamp(),
          profileCompleted: false
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
        // Immediately load the new profile to update context
        await loadUserProfile(userCredential.user.uid);
      } else {
        // Profile already exists, load it
        await loadUserProfile(userCredential.user.uid);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error; // Re-throw so calling code can handle it
    }
  };

  // Sign out
  const signOut = async () => {
    // Cleanup device session first
    console.log('[AuthContext] Signing out, cleaning up session');
    deviceSessionManager.cleanup();
    
    await firebaseSignOut(auth);
    // Clear in-memory state
    setUser(null);
    setUserProfile(null);
    setSessionStatus('inactive');
    setSessionConflict(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      sessionStatus,
      sessionConflict,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
