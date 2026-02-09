/**
 * useUserProfile - Shared hook for user profile state management
 * Single source of truth for profile data across the app
 */
import { useState, useCallback } from 'react';

export interface UserProfile {
  displayName: string;
  bio: string;
  avatarDataUrl: string | null;
  userId?: string; // Unique user identifier
  updatedAt: number;
}

const STORAGE_KEY = 'storyverse:userProfile';

function loadProfileFromStorage(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('[useUserProfile] Failed to load profile:', e);
  }
  return {
    displayName: '',
    bio: '',
    avatarDataUrl: null,
    updatedAt: Date.now()
  };
}

function saveProfileToStorage(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...profile,
      updatedAt: Date.now()
    }));
  } catch (e) {
    console.error('[useUserProfile] Failed to save profile:', e);
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(loadProfileFromStorage);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(current => {
      const updated = { ...current, ...updates };
      saveProfileToStorage(updated);
      return updated;
    });
  }, []);

  return {
    profile,
    updateProfile
  };
}
