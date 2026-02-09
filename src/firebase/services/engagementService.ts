/**
 * Engagement Service - Handle likes, comments, and bookmarks for stories and poems
 * Provides real-time updates to engagement metrics in Firestore
 */

import { 
  doc, 
  updateDoc, 
  increment,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  setDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../config';

export interface Like {
  id: string;
  uid: string;
  contentId: string;
  contentType: 'story' | 'poem';
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  uid: string;
  contentId: string;
  contentType: 'story' | 'poem';
  text: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: Timestamp;
}

export interface SavedRead {
  id: string;
  type: 'story' | 'poem';
  authorId: string;
  savedAt: Timestamp;
}

/**
 * Toggle like on a story
 * If user has already liked, unlike it. Otherwise, add like.
 */
export async function toggleStoryLike(storyId: string): Promise<{ isLiked: boolean; likesCount: number }> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const likesRef = collection(db, 'likes');
  const q = query(
    likesRef,
    where('uid', '==', user.uid),
    where('contentId', '==', storyId),
    where('contentType', '==', 'story')
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // User hasn't liked yet - add like
    await addDoc(likesRef, {
      uid: user.uid,
      contentId: storyId,
      contentType: 'story',
      createdAt: serverTimestamp()
    });

    // Increment likes count on story
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      likesCount: increment(1)
    });

    // Get updated count
    const storyDoc = await getDocs(query(collection(db, 'stories'), where('__name__', '==', storyId)));
    const likesCount = storyDoc.docs[0]?.data()?.likesCount || 1;

    console.log('[EngagementService] Story liked:', { storyId, likesCount });
    return { isLiked: true, likesCount };
  } else {
    // User has already liked - remove like
    const likeDoc = snapshot.docs[0];
    await deleteDoc(doc(db, 'likes', likeDoc.id));

    // Decrement likes count on story
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      likesCount: increment(-1)
    });

    // Get updated count
    const storyDoc = await getDocs(query(collection(db, 'stories'), where('__name__', '==', storyId)));
    const likesCount = Math.max(0, storyDoc.docs[0]?.data()?.likesCount || 0);

    console.log('[EngagementService] Story unliked:', { storyId, likesCount });
    return { isLiked: false, likesCount };
  }
}

/**
 * Toggle like on a poem
 */
export async function togglePoemLike(poemId: string): Promise<{ isLiked: boolean; likesCount: number }> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const likesRef = collection(db, 'likes');
  const q = query(
    likesRef,
    where('uid', '==', user.uid),
    where('contentId', '==', poemId),
    where('contentType', '==', 'poem')
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // User hasn't liked yet - add like
    await addDoc(likesRef, {
      uid: user.uid,
      contentId: poemId,
      contentType: 'poem',
      createdAt: serverTimestamp()
    });

    // Increment likes count on poem
    const poemRef = doc(db, 'poems', poemId);
    await updateDoc(poemRef, {
      likesCount: increment(1)
    });

    // Get updated count
    const poemDoc = await getDocs(query(collection(db, 'poems'), where('__name__', '==', poemId)));
    const likesCount = poemDoc.docs[0]?.data()?.likesCount || 1;

    console.log('[EngagementService] Poem liked:', { poemId, likesCount });
    return { isLiked: true, likesCount };
  } else {
    // User has already liked - remove like
    const likeDoc = snapshot.docs[0];
    await deleteDoc(doc(db, 'likes', likeDoc.id));

    // Decrement likes count on poem
    const poemRef = doc(db, 'poems', poemId);
    await updateDoc(poemRef, {
      likesCount: increment(-1)
    });

    // Get updated count
    const poemDoc = await getDocs(query(collection(db, 'poems'), where('__name__', '==', poemId)));
    const likesCount = Math.max(0, poemDoc.docs[0]?.data()?.likesCount || 0);

    console.log('[EngagementService] Poem unliked:', { poemId, likesCount });
    return { isLiked: false, likesCount };
  }
}

/**
 * Check if current user has liked a story
 */
export async function hasUserLikedStory(storyId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const likesRef = collection(db, 'likes');
  const q = query(
    likesRef,
    where('uid', '==', user.uid),
    where('contentId', '==', storyId),
    where('contentType', '==', 'story')
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Check if current user has liked a poem
 */
export async function hasUserLikedPoem(poemId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const likesRef = collection(db, 'likes');
  const q = query(
    likesRef,
    where('uid', '==', user.uid),
    where('contentId', '==', poemId),
    where('contentType', '==', 'poem')
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Add a comment to a story
 */
export async function addStoryComment(storyId: string, text: string): Promise<Comment> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Get user profile for name and photo
  const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
  const userData = userDoc.docs[0]?.data();
  const authorName = userData?.displayName || 'Anonymous';
  const authorPhotoURL = userData?.photoURL || '';

  // Add comment to comments collection
  const commentsRef = collection(db, 'comments');
  const commentDoc = await addDoc(commentsRef, {
    uid: user.uid,
    contentId: storyId,
    contentType: 'story',
    text,
    authorName,
    authorPhotoURL,
    createdAt: serverTimestamp()
  });

  // Increment comments count on story
  const storyRef = doc(db, 'stories', storyId);
  await updateDoc(storyRef, {
    commentsCount: increment(1)
  });

  console.log('[EngagementService] Comment added to story:', { storyId, commentId: commentDoc.id });

  return {
    id: commentDoc.id,
    uid: user.uid,
    contentId: storyId,
    contentType: 'story',
    text,
    authorName,
    authorPhotoURL,
    createdAt: Timestamp.now()
  };
}

/**
 * Add a comment to a poem
 */
export async function addPoemComment(poemId: string, text: string): Promise<Comment> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Get user profile for name and photo
  const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
  const userData = userDoc.docs[0]?.data();
  const authorName = userData?.displayName || 'Anonymous';
  const authorPhotoURL = userData?.photoURL || '';

  // Add comment to comments collection
  const commentsRef = collection(db, 'comments');
  const commentDoc = await addDoc(commentsRef, {
    uid: user.uid,
    contentId: poemId,
    contentType: 'poem',
    text,
    authorName,
    authorPhotoURL,
    createdAt: serverTimestamp()
  });

  // Increment comments count on poem
  const poemRef = doc(db, 'poems', poemId);
  await updateDoc(poemRef, {
    commentsCount: increment(1)
  });

  console.log('[EngagementService] Comment added to poem:', { poemId, commentId: commentDoc.id });

  return {
    id: commentDoc.id,
    uid: user.uid,
    contentId: poemId,
    contentType: 'poem',
    text,
    authorName,
    authorPhotoURL,
    createdAt: Timestamp.now()
  };
}

/**
 * Get comments for a story
 */
export async function getStoryComments(storyId: string): Promise<Comment[]> {
  const commentsRef = collection(db, 'comments');
  const q = query(
    commentsRef,
    where('contentId', '==', storyId),
    where('contentType', '==', 'story'),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Comment));
}

/**
 * Get comments for a poem
 */
export async function getPoemComments(poemId: string): Promise<Comment[]> {
  const commentsRef = collection(db, 'comments');
  const q = query(
    commentsRef,
    where('contentId', '==', poemId),
    where('contentType', '==', 'poem'),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Comment));
}

// ============================================================
// BOOKMARKS / SAVED READS
// ============================================================

/**
 * Toggle bookmark on a story or poem
 * Saves to user's savedReads subcollection
 */
export async function toggleBookmark(
  contentId: string, 
  contentType: 'story' | 'poem',
  authorId: string
): Promise<{ isSaved: boolean }> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const savedReadRef = doc(db, 'users', user.uid, 'savedReads', contentId);
  const savedReadDoc = await getDoc(savedReadRef);

  if (savedReadDoc.exists()) {
    // Already saved - remove bookmark
    await deleteDoc(savedReadRef);
    console.log('[EngagementService] Bookmark removed:', { contentId, contentType });
    return { isSaved: false };
  } else {
    // Not saved yet - add bookmark
    await setDoc(savedReadRef, {
      id: contentId,
      type: contentType,
      authorId: authorId,
      savedAt: serverTimestamp()
    });
    console.log('[EngagementService] Bookmark added:', { contentId, contentType });
    return { isSaved: true };
  }
}

/**
 * Check if user has bookmarked a specific item
 */
export async function isBookmarked(contentId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const savedReadRef = doc(db, 'users', user.uid, 'savedReads', contentId);
  const savedReadDoc = await getDoc(savedReadRef);
  
  return savedReadDoc.exists();
}

/**
 * Get all saved reads for current user
 * Returns array of saved read references
 */
export async function getSavedReads(): Promise<SavedRead[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const savedReadsRef = collection(db, 'users', user.uid, 'savedReads');
  const snapshot = await getDocs(savedReadsRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SavedRead));
}

