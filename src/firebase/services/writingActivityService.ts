/**
 * Writing Activity Service
 * 
 * PERMANENT FIX for streak and heatmap logic.
 * 
 * RULE: Activity is session-based, NOT story-based.
 * 
 * Activity must NOT depend on story.updatedAt or story.createdAt.
 * Instead, we maintain a separate writingActivity collection that tracks:
 * - When the user writes/saves content
 * - How many words were written that day
 * - Session count
 * - First and last write times
 * 
 * ARCHITECTURE:
 * - Heatmap: checks if date document exists in writingActivity
 * - Streak: counts consecutive dates with existing documents
 * - Recording: happens when editor saves text (autosave or manual)
 * 
 * CRITICAL GUARANTEE:
 * Once a date document is created, it is NEVER deleted or modified by edits to old content.
 * This ensures white dots remain permanent on the heatmap.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';

export interface WritingActivityDay {
  date: string; // YYYY-MM-DD
  wordCount: number; // Total words written on this day
  storyIds: string[]; // Stories edited on this day
  createdAt: Timestamp; // When this activity document was first created
  updatedAt?: Timestamp; // When activity was last updated
}

/**
 * Format date to YYYY-MM-DD string for use as document ID
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Record writing activity for today.
 * 
 * This is the PRIMARY way activity is tracked.
 * Creates or updates the activity document for today.
 * 
 * Called when:
 * - Content length changes (editor detects typing)
 * - User saves text (manual or autosave)
 * - Text content is committed to Firestore
 * 
 * BEHAVIOR:
 * - If today's document doesn't exist: create it
 * - If today's document exists: update wordCount and add storyId if new
 * - NEVER delete past documents
 * - NEVER overwrite historical data
 * 
 * @param uid User ID
 * @param wordCount Total words in the content being saved
 * @param storyId Optional: which story/poem this is from
 */
export async function recordWritingActivity(
  uid: string,
  wordCount: number = 1,
  storyId?: string
): Promise<void> {
  if (!uid) {
    console.warn('[ACTIVITY] Invalid uid to recordWritingActivity');
    return;
  }

  // MINIMUM THRESHOLD: Only record if at least 1 word
  if (wordCount < 1) {
    console.log('[ACTIVITY] Ignoring sub-threshold activity (wordCount < 1)');
    return;
  }

  try {
    const today = new Date();
    const dateKey = formatDateKey(today);
    const now = serverTimestamp();

    const activityRef = doc(db, `users/${uid}/writingActivity`, dateKey);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      // First write today - CREATE new document
      console.log('[ACTIVITY] 🆕 Creating activity for', dateKey, 'with', wordCount, 'words');
      
      const storyIds = storyId ? [storyId] : [];
      await setDoc(activityRef, {
        date: dateKey,
        wordCount: wordCount,
        storyIds: storyIds,
        createdAt: now, // First write timestamp (NEVER changes)
        updatedAt: now,
      });
    } else {
      // Activity exists for today - UPDATE only wordCount and storyIds
      const current = activityDoc.data() as WritingActivityDay;
      const currentWordCount = current.wordCount || 0;
      const currentStoryIds = Array.from(new Set([...(current.storyIds || []), ...(storyId ? [storyId] : [])]))
      
      console.log('[ACTIVITY] 📝 Updating activity for', dateKey, 
        'wordCount:', currentWordCount, '→', wordCount);
      
      await setDoc(
        activityRef,
        {
          wordCount: wordCount, // Set to current total (not delta)
          storyIds: currentStoryIds,
          updatedAt: now,
          // IMPORTANT: Do NOT touch createdAt - it's immutable
        },
        { merge: true }
      );
    }

    console.log('[ACTIVITY] ✅ Activity recorded for', dateKey);
  } catch (error) {
    console.error('[ACTIVITY] ❌ Failed to record activity:', error);
    // Don't throw - activity tracking is non-critical
  }
}

/**
 * Fetch all activity dates for a user within date range.
 * Returns Set of date strings in YYYY-MM-DD format.
 * 
 * Used by:
 * - Heatmap to determine which dates have active dots
 * - Streak calculation to find consecutive days
 * 
 * PERFORMANCE: Uses date field as document ID for fast indexed lookup.
 * 
 * @param uid User ID
 * @param startDate Start of date range (inclusive)
 * @param endDate End of date range (inclusive)
 */
export async function fetchActivityDates(
  uid: string,
  startDate: Date,
  endDate: Date
): Promise<Set<string>> {
  if (!uid) return new Set();

  try {
    console.log('[ACTIVITY] 📊 Fetching activity dates for', uid, 'from', startDate, 'to', endDate);

    // Fetch all documents in the writingActivity collection for this user
    const activityRef = collection(db, `users/${uid}/writingActivity`);
    const snapshot = await getDocs(activityRef);

    const activeDates = new Set<string>();

    snapshot.forEach((docSnap) => {
      const dateStr = docSnap.id; // Document ID is the date in YYYY-MM-DD format

      // Parse the date string
      const [year, month, day] = dateStr.split('-').map(Number);
      const activityDate = new Date(year, month - 1, day);

      // Check if within range
      if (activityDate >= startDate && activityDate <= endDate) {
        activeDates.add(dateStr);
      }
    });

    console.log('[ACTIVITY] ✅ Found', activeDates.size, 'active dates');
    return activeDates;
  } catch (error) {
    console.error('[ACTIVITY] ❌ Failed to fetch activity dates:', error);
    return new Set();
  }
}

/**
 * Calculate current streak from activity dates.
 * 
 * RULE:
 * - Start from today and work backwards
 * - Count consecutive days with activity documents
 * - Stop at first gap
 * 
 * Edge cases:
 * - If today has no activity: check yesterday (streak = 1 if yesterday exists, else 0)
 * - Maximum lookback: 365 days
 * 
 * @param uid User ID
 */
export async function calculateCurrentStreak(uid: string): Promise<number> {
  if (!uid) return 0;

  try {
    console.log('[ACTIVITY] 🔥 Calculating streak for', uid);

    // Fetch last 65 days of activity (with buffer for efficiency)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 65);

    const activeDates = await fetchActivityDates(uid, startDate, endDate);

    let streak = 0;
    let checkDate = new Date();

    // Start from today and work backwards
    while (streak < 365) {
      const dateKey = formatDateKey(checkDate);

      if (activeDates.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If it's today with no activity, check yesterday
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayKey = formatDateKey(checkDate);
          if (activeDates.has(yesterdayKey)) {
            streak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        // Gap found - stop counting
        break;
      }
    }

    console.log('[ACTIVITY] ✅ Current streak:', streak);
    return streak;
  } catch (error) {
    console.error('[ACTIVITY] ❌ Failed to calculate streak:', error);
    return 0;
  }
}

/**
 * Calculate longest streak from all activity.
 * 
 * @param uid User ID
 */
export async function calculateLongestStreak(uid: string): Promise<number> {
  if (!uid) return 0;

  try {
    console.log('[ACTIVITY] 📈 Calculating longest streak for', uid);

    // Fetch ALL activity documents
    const activityRef = collection(db, `users/${uid}/writingActivity`);
    const snapshot = await getDocs(activityRef);

    const dateDocs = new Map<string, Date>();

    snapshot.forEach((docSnap) => {
      const dateStr = docSnap.id;
      const [year, month, day] = dateStr.split('-').map(Number);
      dateDocs.set(dateStr, new Date(year, month - 1, day));
    });

    if (dateDocs.size === 0) return 0;

    // Sort dates
    const sortedDates = Array.from(dateDocs.values()).sort(
      (a, b) => a.getTime() - b.getTime()
    );

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];

      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (Math.abs(diffDays - 1) < 0.1) {
        // Consecutive day (allowing for timezone rounding)
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        // Break in streak
        currentStreak = 1;
      }
    }

    console.log('[ACTIVITY] ✅ Longest streak:', longestStreak);
    return longestStreak;
  } catch (error) {
    console.error('[ACTIVITY] ❌ Failed to calculate longest streak:', error);
    return 0;
  }
}
