/**
 * STORYVERSE CONTENT LIMITS SERVICE
 * 
 * Enforces hard limits on user content to maintain 1GB global storage cap
 * for 100+ concurrent users (free tier only).
 * 
 * LIMITS:
 * - Stories: 10 per user
 * - Poems: 20 per user
 * - Characters: 20 per story
 * - Profile photo: 1 per user
 * - All images: ≤ 50 KB WebP
 * 
 * RULES:
 * - Block creation beyond limits
 * - Always allow editing existing content
 * - No upgrade prompts (free tier only)
 */

import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../config';

// ============================================================
// CONTENT LIMITS CONSTANTS
// ============================================================

export const CONTENT_LIMITS = {
  MAX_STORIES_PER_USER: 10,
  MAX_POEMS_PER_USER: 20,
  MAX_CHARACTERS_PER_STORY: 20,
  MAX_IMAGE_SIZE_KB: 50,
  MAX_IMAGE_SIZE_BYTES: 50 * 1024, // 50 KB
} as const;

// ============================================================
// TYPES
// ============================================================

export interface ContentLimitCheck {
  allowed: boolean;
  currentCount: number;
  limit: number;
  message?: string;
}

export interface UserContentCounts {
  stories: number;
  poems: number;
}

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Check if user can create a new story
 */
export async function canCreateStory(uid: string): Promise<ContentLimitCheck> {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('uid', '==', uid));
    const snapshot = await getCountFromServer(q);
    const currentCount = snapshot.data().count;

    const allowed = currentCount < CONTENT_LIMITS.MAX_STORIES_PER_USER;

    return {
      allowed,
      currentCount,
      limit: CONTENT_LIMITS.MAX_STORIES_PER_USER,
      message: allowed 
        ? undefined 
        : `You've reached the current story limit (${CONTENT_LIMITS.MAX_STORIES_PER_USER} stories).`,
    };
  } catch (error) {
    console.error('[ContentLimits] Error checking story limit:', error);
    // Fail open to allow creation if check fails
    return {
      allowed: true,
      currentCount: 0,
      limit: CONTENT_LIMITS.MAX_STORIES_PER_USER,
    };
  }
}

/**
 * Check if user can create a new poem
 */
export async function canCreatePoem(uid: string): Promise<ContentLimitCheck> {
  try {
    const poemsRef = collection(db, 'poems');
    const q = query(poemsRef, where('uid', '==', uid));
    const snapshot = await getCountFromServer(q);
    const currentCount = snapshot.data().count;

    const allowed = currentCount < CONTENT_LIMITS.MAX_POEMS_PER_USER;

    return {
      allowed,
      currentCount,
      limit: CONTENT_LIMITS.MAX_POEMS_PER_USER,
      message: allowed 
        ? undefined 
        : `You've reached the current poem limit (${CONTENT_LIMITS.MAX_POEMS_PER_USER} poems).`,
    };
  } catch (error) {
    console.error('[ContentLimits] Error checking poem limit:', error);
    // Fail open to allow creation if check fails
    return {
      allowed: true,
      currentCount: 0,
      limit: CONTENT_LIMITS.MAX_POEMS_PER_USER,
    };
  }
}

/**
 * Check if story can have a new character
 */
export async function canAddCharacter(storyId: string): Promise<ContentLimitCheck> {
  try {
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where('storyId', '==', storyId));
    const snapshot = await getCountFromServer(q);
    const currentCount = snapshot.data().count;

    const allowed = currentCount < CONTENT_LIMITS.MAX_CHARACTERS_PER_STORY;

    return {
      allowed,
      currentCount,
      limit: CONTENT_LIMITS.MAX_CHARACTERS_PER_STORY,
      message: allowed 
        ? undefined 
        : `This story has reached the current character limit (${CONTENT_LIMITS.MAX_CHARACTERS_PER_STORY} characters).`,
    };
  } catch (error) {
    console.error('[ContentLimits] Error checking character limit:', error);
    // Fail open to allow creation if check fails
    return {
      allowed: true,
      currentCount: 0,
      limit: CONTENT_LIMITS.MAX_CHARACTERS_PER_STORY,
    };
  }
}

/**
 * Get user's current content counts
 */
export async function getUserContentCounts(uid: string): Promise<UserContentCounts> {
  try {
    const [storiesSnapshot, poemsSnapshot] = await Promise.all([
      getCountFromServer(query(collection(db, 'stories'), where('uid', '==', uid))),
      getCountFromServer(query(collection(db, 'poems'), where('uid', '==', uid))),
    ]);

    return {
      stories: storiesSnapshot.data().count,
      poems: poemsSnapshot.data().count,
    };
  } catch (error) {
    console.error('[ContentLimits] Error getting user content counts:', error);
    return {
      stories: 0,
      poems: 0,
    };
  }
}

/**
 * Validate image file size before upload
 */
export function validateImageSize(file: File): { valid: boolean; message?: string } {
  if (file.size > CONTENT_LIMITS.MAX_IMAGE_SIZE_BYTES) {
    const sizeKB = Math.round(file.size / 1024);
    return {
      valid: false,
      message: `Image is too large (${sizeKB} KB). Maximum size is ${CONTENT_LIMITS.MAX_IMAGE_SIZE_KB} KB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate image file type (must be WebP or convertible)
 */
export function validateImageType(file: File): { valid: boolean; message?: string } {
  const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Image must be WebP, JPEG, or PNG format.',
    };
  }

  return { valid: true };
}

// ============================================================
// OFFLINE VALIDATION (for local state)
// ============================================================

/**
 * Check limits against local/cached counts
 * Use this for immediate UI feedback before server validation
 */
export function canCreateStoryOffline(currentStoryCount: number): ContentLimitCheck {
  const allowed = currentStoryCount < CONTENT_LIMITS.MAX_STORIES_PER_USER;

  return {
    allowed,
    currentCount: currentStoryCount,
    limit: CONTENT_LIMITS.MAX_STORIES_PER_USER,
    message: allowed 
      ? undefined 
      : `You've reached the current story limit (${CONTENT_LIMITS.MAX_STORIES_PER_USER} stories).`,
  };
}

/**
 * Check poem limits offline
 */
export function canCreatePoemOffline(currentPoemCount: number): ContentLimitCheck {
  const allowed = currentPoemCount < CONTENT_LIMITS.MAX_POEMS_PER_USER;

  return {
    allowed,
    currentCount: currentPoemCount,
    limit: CONTENT_LIMITS.MAX_POEMS_PER_USER,
    message: allowed 
      ? undefined 
      : `You've reached the current poem limit (${CONTENT_LIMITS.MAX_POEMS_PER_USER} poems).`,
  };
}

/**
 * Check character limits offline
 */
export function canAddCharacterOffline(currentCharacterCount: number): ContentLimitCheck {
  const allowed = currentCharacterCount < CONTENT_LIMITS.MAX_CHARACTERS_PER_STORY;

  return {
    allowed,
    currentCount: currentCharacterCount,
    limit: CONTENT_LIMITS.MAX_CHARACTERS_PER_STORY,
    message: allowed 
      ? undefined 
      : `This story has reached the current character limit (${CONTENT_LIMITS.MAX_CHARACTERS_PER_STORY} characters).`,
  };
}
