/**
 * Poems Service - Firestore data layer for poems
 * CRITICAL: All poems must be scoped by UID
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

export interface Poem {
  id: string;
  uid: string; // REQUIRED - owner's Firebase UID
  title: string;
  text: string;
  coverImageUrl: string;
  genre: string;
  tags: string[];
  privacy: string; // 'Private' | 'Open access' | 'Trending'
  lineCount: number;
  stanzaCount: number;
  wordCount: number;
  readTime: number;
  // Engagement stats
  likesCount: number;
  commentsCount: number;
  // Author info (denormalized for faster reads)
  authorName?: string;
  authorPhotoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create a new poem
 * CRITICAL: Automatically adds uid field
 */
export async function createPoem(poemId: string, data: Partial<Poem>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const poemRef = doc(db, 'poems', poemId);
  await setDoc(poemRef, {
    ...data,
    id: poemId,
    uid: user.uid, // CRITICAL: Always set UID
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Update an existing poem
 * CRITICAL: Validates ownership before updating
 */
export async function updatePoem(poemId: string, data: Partial<Poem>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const poemRef = doc(db, 'poems', poemId);
  const poemDoc = await getDoc(poemRef);

  if (!poemDoc.exists()) {
    throw new Error('Poem not found');
  }

  // CRITICAL: Validate ownership
  if (poemDoc.data().uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this poem');
  }

  await updateDoc(poemRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/**
 * Get a poem by ID
 * CRITICAL: Allows access to public poems, validates ownership for private poems
 */
export async function getPoem(poemId: string): Promise<Poem | null> {
  const user = auth.currentUser;
  const poemRef = doc(db, 'poems', poemId);
  const poemDoc = await getDoc(poemRef);

  if (!poemDoc.exists()) {
    return null;
  }

  const poem = poemDoc.data() as Poem;

  // CRITICAL: Validate access permissions
  // Only block if poem is private AND doesn't belong to current user
  const isPrivate = poem.privacy === 'private';
  const isOwner = poem.uid === user?.uid;
  
  if (isPrivate && !isOwner) {
    throw new Error('Unauthorized: This poem is private');
  }

  return poem;
}

/**
 * Get all poems for a specific user
 * CRITICAL: Only returns poems owned by the specified UID
 */
export async function getUserPoems(uid: string): Promise<Poem[]> {
  const poemsRef = collection(db, 'poems');
  const q = query(
    poemsRef,
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Poem);
}

/**
 * Get published poems for a user (for public profile)
 * CRITICAL: Only returns Trending poems (visible to public)
 */
export async function getPublishedUserPoems(uid: string): Promise<Poem[]> {
  const poemsRef = collection(db, 'poems');
  
  // Get all poems for this user
  const q = query(
    poemsRef,
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  
  // Filter for Trending poems only (public visibility)
  return querySnapshot.docs
    .map(doc => doc.data() as Poem)
    .filter(poem => poem.privacy === 'Trending');
}

/**
 * Delete a poem
 * CRITICAL: Validates ownership before deleting
 */
export async function deletePoem(poemId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const poemRef = doc(db, 'poems', poemId);
  const poemDoc = await getDoc(poemRef);

  if (!poemDoc.exists()) {
    throw new Error('Poem not found');
  }

  // CRITICAL: Validate ownership
  if (poemDoc.data().uid !== user.uid) {
    throw new Error('Unauthorized: You do not own this poem');
  }

  await deleteDoc(poemRef);
}

/**
 * Get current user's poems
 */
export async function getCurrentUserPoems(): Promise<Poem[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  return getUserPoems(user.uid);
}
