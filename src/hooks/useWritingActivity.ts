/**
 * useWritingActivity Hook
 * Shared hook for writing activity data across dashboard components
 * Tracks user's writing activity for streak calculation and heatmap visualization
 */
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';

interface ActivityData {
  activeDays: Set<string>;
  currentStreak: number;
  longestStreak: number;
  storyCount: number;
  poemCount: number;
  loading: boolean;
}

/**
 * Format date to YYYY-MM-DD string
 */
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate current streak (consecutive days from today backwards)
 */
const calculateCurrentStreak = (activeDays: Set<string>): number => {
  let streak = 0;
  let checkDate = new Date();
  
  // Start from today and go backwards
  while (true) {
    const dateKey = formatDateKey(checkDate);
    
    if (activeDays.has(dateKey)) {
      streak++;
      // Go back one day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If it's today and no activity, check yesterday
      // (streak continues if you wrote yesterday)
      if (streak === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayKey = formatDateKey(checkDate);
        if (activeDays.has(yesterdayKey)) {
          streak = 1;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
    
    // Safety limit: don't go back more than 365 days
    if (streak >= 365) break;
  }
  
  return streak;
};

/**
 * Calculate longest streak in the dataset
 */
const calculateLongestStreak = (activeDays: Set<string>): number => {
  if (activeDays.size === 0) return 0;
  
  // Convert to sorted array of dates
  const sortedDates = Array.from(activeDays)
    .map(key => new Date(key))
    .sort((a, b) => a.getTime() - b.getTime());
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currDate = sortedDates[i];
    
    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Break in streak
      currentStreak = 1;
    }
  }
  
  return longestStreak;
};

export function useWritingActivity(): ActivityData {
  const { user } = useAuth();
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
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
        const startTimestamp = Timestamp.fromDate(startDate);
        const activitySet = new Set<string>();

        // Fetch stories
        const storiesQuery = query(
          collection(db, 'stories'),
          where('uid', '==', user.uid)
        );

        const storiesSnapshot = await getDocs(storiesQuery);
        let storyCountInRange = 0;
        
        storiesSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Track activity from both createdAt and updatedAt
          const dates: Date[] = [];
          
          if (data.createdAt) {
            dates.push(data.createdAt.toDate());
          }
          
          if (data.updatedAt && data.updatedAt >= startTimestamp) {
            dates.push(data.updatedAt.toDate());
            storyCountInRange++;
          }
          
          // Mark all dates as active (once active, always active)
          dates.forEach(date => {
            if (date >= startDate) {
              const dateKey = formatDateKey(date);
              activitySet.add(dateKey);
            }
          });
        });
        
        setStoryCount(storyCountInRange);

        // Fetch poems
        const poemsQuery = query(
          collection(db, 'poems'),
          where('uid', '==', user.uid)
        );

        const poemsSnapshot = await getDocs(poemsQuery);
        let poemCountInRange = 0;
        
        poemsSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Track activity from both createdAt and updatedAt
          const dates: Date[] = [];
          
          if (data.createdAt) {
            dates.push(data.createdAt.toDate());
          }
          
          if (data.updatedAt && data.updatedAt >= startTimestamp) {
            dates.push(data.updatedAt.toDate());
            poemCountInRange++;
          }
          
          // Mark all dates as active (once active, always active)
          dates.forEach(date => {
            if (date >= startDate) {
              const dateKey = formatDateKey(date);
              activitySet.add(dateKey);
            }
          });
        });
        
        setPoemCount(poemCountInRange);
        setActiveDays(activitySet);
        
        console.log(`[useWritingActivity] Found ${activitySet.size} active days across ${storyCountInRange} stories and ${poemCountInRange} poems`);
      } catch (error) {
        console.error('[useWritingActivity] Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user, startDate]);

  // Calculate streaks
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(activeDays);
  }, [activeDays]);

  const longestStreak = useMemo(() => {
    return calculateLongestStreak(activeDays);
  }, [activeDays]);

  return {
    activeDays,
    currentStreak,
    longestStreak,
    storyCount,
    poemCount,
    loading
  };
}
