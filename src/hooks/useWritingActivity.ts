/**
 * useWritingActivity Hook
 * 
 * FIXED VERSION: Uses session-based activity tracking.
 * 
 * Activity is NO LONGER calculated from story timestamps.
 * Now reads from users/{uid}/writingActivity/{date} collection.
 * 
 * Benefits:
 * - White dots remain permanent (editing old stories doesn't affect heatmap)
 * - Streak accurate (counts consecutive writing days, not timestamp changes)
 * - Performance (doesn't fetch all stories)
 */
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import {
  fetchActivityDates,
  calculateCurrentStreak,
  calculateLongestStreak,
  formatDateKey,
} from '../firebase/services/writingActivityService';

interface ActivityData {
  activeDays: Set<string>;
  currentStreak: number;
  longestStreak: number;
  storyCount: number;
  poemCount: number;
  loading: boolean;
}

export function useWritingActivity(): ActivityData {
  const { user } = useAuth();
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [storyCount, setStoryCount] = useState(0);
  const [poemCount, setPoemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calculate date range for 3 months
  const startDate = useMemo(() => {
    const now = new Date();
    // Go back 2 months from current month
    return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      try {
        // Fetch activity dates from writingActivity collection (NEW WAY)
        const endDate = new Date();
        const activitySet = await fetchActivityDates(user.uid, startDate, endDate);
        setActiveDays(activitySet);

        // Fetch streak counts
        const currentStreakVal = await calculateCurrentStreak(user.uid);
        const longestStreakVal = await calculateLongestStreak(user.uid);
        setCurrentStreak(currentStreakVal);
        setLongestStreak(longestStreakVal);

        // Fetch story and poem counts (still from story/poem collections for display)
        let storyCountInRange = 0;
        let poemCountInRange = 0;

        const storiesQuery = query(
          collection(db, 'stories'),
          where('uid', '==', user.uid)
        );
        const storiesSnapshot = await getDocs(storiesQuery);
        storyCountInRange = storiesSnapshot.size;
        setStoryCount(storyCountInRange);

        const poemsQuery = query(
          collection(db, 'poems'),
          where('uid', '==', user.uid)
        );
        const poemsSnapshot = await getDocs(poemsQuery);
        poemCountInRange = poemsSnapshot.size;
        setPoemCount(poemCountInRange);

        console.log(
          `[useWritingActivity] ✅ Activity loaded: ${activitySet.size} active days, ` +
            `streak: ${currentStreakVal}, stories: ${storyCountInRange}, poems: ${poemCountInRange}`
        );
      } catch (error) {
        console.error('[useWritingActivity] ❌ Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user, startDate]);

  return {
    activeDays,
    currentStreak,
    longestStreak,
    storyCount,
    poemCount,
    loading,
  };
}
