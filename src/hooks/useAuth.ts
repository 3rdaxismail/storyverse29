/**
 * useAuth - Authentication state management hook
 * Handles login, logout, signup, and auth state persistence
 */
import { useState } from 'react';

interface AuthState {
  email: string;
  isAuthenticated: boolean;
  profileSetupComplete: boolean;
  userId?: string; // Unique user identifier from profile setup
}

const getInitialAuthState = (): AuthState => {
  const storedAuth = localStorage.getItem('storyverse:auth');
  if (storedAuth) {
    try {
      return JSON.parse(storedAuth);
    } catch (error) {
      console.error('Failed to parse auth state:', error);
    }
  }
  return {
    email: '',
    isAuthenticated: false,
    profileSetupComplete: false,
  };
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  const login = (email: string) => {
    const newAuth: AuthState = {
      email,
      isAuthenticated: true,
      profileSetupComplete: false,
    };
    localStorage.setItem('storyverse:auth', JSON.stringify(newAuth));
    setAuthState(newAuth);
  };

  const logout = () => {
    localStorage.removeItem('storyverse:auth');
    localStorage.removeItem('storyverse:userProfile');
    // Clear all cached data on logout
    sessionStorage.clear();
    setAuthState({
      email: '',
      isAuthenticated: false,
      profileSetupComplete: false,
    });
  };

  const signup = (email: string) => {
    const newAuth: AuthState = {
      email,
      isAuthenticated: true,
      profileSetupComplete: false,
    };
    localStorage.setItem('storyverse:auth', JSON.stringify(newAuth));
    setAuthState(newAuth);
  };

  const completeProfileSetup = () => {
    const updatedAuth = {
      ...authState,
      profileSetupComplete: true,
    };
    localStorage.setItem('storyverse:auth', JSON.stringify(updatedAuth));
    setAuthState(updatedAuth);
  };

  return {
    ...authState,
    login,
    logout,
    signup,
    completeProfileSetup,
  };
}
