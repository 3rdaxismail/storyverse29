/**
 * Stories Service - Firestore data layer for stories
 * CRITICAL: All stories must be scoped by UID
 */
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config';

// Complete story data structure matching StorageManager
export interface Character {
  characterId: string;
  name: string;
  avatar?: string;
  initials: string;
  order: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT';
  description?: string;
  image?: string;
  createdAt: number;
}

export interface Act {
  actId: string;
  actTitle: string;
  actOrder: number;
}

export interface Chapter {
  chapterId: string;
  actId: string;
  chapterTitle: string;
  assignedCharacterIds: string[];
  assignedLocationIds: string[];
  expanded: boolean;
  chapterOrder: number;
  lastEditedAt: number;
}

export interface ChapterContent {
  chapterId: string;
  text: string;
  wordCount: number;
  charCount: number;
  state: 'empty' | 'writing' | 'idle' | 'syncing' | 'error';
  lastSavedAt: number;
}

export interface Story {
  id: string;
  uid: string; // REQUIRED - owner's Firebase UID
  storyTitle: string;
  privacy: string;
  primaryGenre: string;
  secondaryGenre: string;
  tertiaryGenre: string;
  audience: string;
  readingTime: number;
  wordCount: number;
  excerptHeading: string;
  excerptBody: string;
  coverImageId?: string;
  coverImageUrl?: string;
  status: 'draft' | 'published';
  // Engagement stats
  likesCount: number;
  commentsCount: number;
  // Author info (denormalized for faster reads)
  authorName?: string;
  authorPhotoURL?: string;
  // Characters and Locations (stored directly in story document)
  characters?: Character[];
  locations?: Location[];
  // Acts and Chapters structure (stored directly in story document)
  acts?: Act[];
  chapters?: Chapter[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StoryMetadata {
  storyTitle: string;
  primaryGenre: string;
  coverImageUrl: string;
  readingTime: number;
  authorId: string; // For compatibility with existing code
}

/**
 * Create a new story
 * CRITICAL: Automatically adds uid field
 */
export async function createStory(storyId: string, data: Partial<Story>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const storyRef = doc(db, 'stories', storyId);
  await setDoc(storyRef, {
    ...data,
    id: storyId,
    uid: user.uid, // CRITICAL: Always set UID
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Update an existing story
 * CRITICAL: Validates ownership before updating
 */
export async function updateStory(storyId: string, data: Partial<Story>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);

  if (!storyDoc.exists()) {
    throw new Error('Story not found');
  }

  // CRITICAL: Validate ownership
  if (storyDoc.data().uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this story');
  }

  await updateDoc(storyRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/**
 * Get a story by ID
 * CRITICAL: Allows access to public stories, validates ownership for private stories
 */
export async function getStory(storyId: string): Promise<Story | null> {
  const user = auth.currentUser;
  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);

  if (!storyDoc.exists()) {
    return null;
  }

  const story = storyDoc.data() as Story;

  // CRITICAL: Validate access permissions
  // Only block if story is private AND doesn't belong to current user
  const isPrivate = story.privacy?.toLowerCase() === 'private';
  const isOwner = story.uid === user?.uid;
  
  if (isPrivate && !isOwner) {
    throw new Error('Unauthorized: This story is private');
  }

  return story;
}

/**
 * Get all stories for a specific user
 * CRITICAL: Only returns stories owned by the specified UID
 */
export async function getUserStories(uid: string): Promise<Story[]> {
  const storiesRef = collection(db, 'stories');
  const q = query(
    storiesRef,
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Story);
}

/**
 * Get published stories for a user (for public profile)
 * CRITICAL: Only returns Trending stories (visible to public)
 */
export async function getPublishedUserStories(uid: string): Promise<Story[]> {
  const storiesRef = collection(db, 'stories');
  
  // Get all stories for this user
  const q = query(
    storiesRef,
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  
  // Filter for Trending stories only (public visibility)
  return querySnapshot.docs
    .map(doc => doc.data() as Story)
    .filter(story => story.privacy === 'Trending');
}

/**
 * Delete a story
 * CRITICAL: Validates ownership before deleting
 */
export async function deleteStory(storyId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);

  if (!storyDoc.exists()) {
    throw new Error('Story not found');
  }

  // CRITICAL: Validate ownership
  if (storyDoc.data().uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this story');
  }

  await deleteDoc(storyRef);
}

/**
 * Get current user's stories
 */
export async function getCurrentUserStories(): Promise<Story[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  return getUserStories(user.uid);
}

// ============================================================
// CHARACTERS - Stored as subcollection under story
// ============================================================

/**
 * Save characters for a story
 * Stores characters directly in the story document to avoid subcollection permission issues
 */
export async function saveCharacters(storyId: string, characters: Character[]): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);

  if (!storyDoc.exists()) {
    throw new Error('Story not found');
  }

  // Validate ownership
  if (storyDoc.data().uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this story');
  }

  await updateDoc(storyRef, {
    characters,
    updatedAt: serverTimestamp()
  });
}

/**
 * Load characters for a story
 * Reads from the story document itself
 */
export async function loadCharacters(storyId: string): Promise<Character[]> {
  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);
  
  if (!storyDoc.exists()) {
    return [];
  }

  return storyDoc.data().characters || [];
}

// ============================================================
// LOCATIONS - Stored as subcollection under story
// ============================================================

/**
 * Save locations for a story
 * Stores locations directly in the story document to avoid subcollection permission issues
 */
export async function saveLocations(storyId: string, locations: Location[]): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);

  if (!storyDoc.exists()) {
    throw new Error('Story not found');
  }

  // Validate ownership
  if (storyDoc.data().uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this story');
  }

  await updateDoc(storyRef, {
    locations,
    updatedAt: serverTimestamp()
  });
}

/**
 * Load locations for a story
 * Reads from the story document itself
 */
export async function loadLocations(storyId: string): Promise<Location[]> {
  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);
  
  if (!storyDoc.exists()) {
    return [];
  }

  return storyDoc.data().locations || [];
}

// ============================================================
// ACTS & CHAPTERS - Stored directly in story document
// ============================================================

/**
 * Save acts and chapters for a story
 * Stores directly in story document to avoid subcollection permission issues
 */
export async function saveActsAndChapters(storyId: string, acts: Act[], chapters: Chapter[]): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);

  if (!storyDoc.exists()) {
    throw new Error('Story not found');
  }

  // Validate ownership
  if (storyDoc.data().uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this story');
  }

  await updateDoc(storyRef, {
    acts,
    chapters,
    updatedAt: serverTimestamp()
  });
}

/**
 * Load acts and chapters for a story
 * Reads from story document
 */
export async function loadActsAndChapters(storyId: string): Promise<{ acts: Act[], chapters: Chapter[] }> {
  const storyRef = doc(db, 'stories', storyId);
  const storyDoc = await getDoc(storyRef);
  
  if (!storyDoc.exists()) {
    return { acts: [], chapters: [] };
  }

  const data = storyDoc.data();
  return {
    acts: data.acts || [],
    chapters: data.chapters || []
  };
}

// ============================================================
// CHAPTER CONTENT - Each chapter's text stored separately
// ============================================================

/**
 * Save chapter content
 */
export async function saveChapterContent(storyId: string, chapterId: string, content: ChapterContent): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Validate ownership
  const story = await getStory(storyId);
  if (!story || story.uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this story');
  }

  const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
  await setDoc(chapterRef, content);
}

/**
 * Load chapter content
 */
export async function loadChapterContent(storyId: string, chapterId: string): Promise<ChapterContent | null> {
  const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
  const chapterDoc = await getDoc(chapterRef);
  
  if (!chapterDoc.exists()) {
    return null;
  }

  return chapterDoc.data() as ChapterContent;
}
