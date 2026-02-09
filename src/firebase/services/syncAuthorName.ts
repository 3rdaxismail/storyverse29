/**
 * Sync Author Name - Update author name across all user's stories and poems
 * 
 * This function updates the authorName field in all story and poem documents
 * when a user changes their display name in their profile.
 */

import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config';

/**
 * Update author name in all stories and poems for a user
 * @param userId - User ID
 * @param newDisplayName - New display name to set
 * @returns Promise with count of updated documents
 */
export async function syncAuthorNameAcrossContent(
  userId: string,
  newDisplayName: string
): Promise<{ storiesUpdated: number; poemsUpdated: number }> {
  console.log('[syncAuthorName] Starting sync for user:', userId, 'New name:', newDisplayName);
  
  try {
    const batch = writeBatch(db);
    let storiesCount = 0;
    let poemsCount = 0;

    // Update all stories
    const storiesQuery = query(
      collection(db, 'stories'),
      where('uid', '==', userId)
    );
    const storiesSnapshot = await getDocs(storiesQuery);
    
    storiesSnapshot.forEach((docSnapshot) => {
      const storyRef = doc(db, 'stories', docSnapshot.id);
      batch.update(storyRef, { authorName: newDisplayName });
      storiesCount++;
    });

    // Update all poems
    const poemsQuery = query(
      collection(db, 'poems'),
      where('uid', '==', userId)
    );
    const poemsSnapshot = await getDocs(poemsQuery);
    
    poemsSnapshot.forEach((docSnapshot) => {
      const poemRef = doc(db, 'poems', docSnapshot.id);
      batch.update(poemRef, { authorName: newDisplayName });
      poemsCount++;
    });

    // Commit all updates in a single batch
    if (storiesCount > 0 || poemsCount > 0) {
      await batch.commit();
      console.log('[syncAuthorName] ✅ Updated:', storiesCount, 'stories,', poemsCount, 'poems');
    } else {
      console.log('[syncAuthorName] No documents to update');
    }

    return { storiesUpdated: storiesCount, poemsUpdated: poemsCount };
  } catch (error) {
    console.error('[syncAuthorName] ❌ Failed to sync author name:', error);
    throw error;
  }
}
