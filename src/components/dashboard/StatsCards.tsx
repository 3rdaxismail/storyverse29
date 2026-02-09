/**
 * StatsCards Component
 * Displays user writing stats: total words and current streak
 */
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../firebase/AuthContext';
import { useWritingActivity } from '../../hooks/useWritingActivity';
import iconTotalWords from '../../assets/icon-stat-total-words.svg';
import iconStreak from '../../assets/icon-stat-streak.svg';
import styles from './StatsCards.module.css';

/**
 * Custom hook for count-up animation
 */
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    setIsAnimating(true);
    startTimeRef.current = undefined;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentCount = Math.floor(easeProgress * end);
      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsAnimating(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  return { count, isAnimating };
}

export default function StatsCards() {
  const { user } = useAuth();
  const [totalWords, setTotalWords] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Get current streak from writing activity hook
  const { currentStreak, loading: activityLoading } = useWritingActivity();

  // Count-up animations - streak is faster since it's typically a small number
  const { count: animatedWords } = useCountUp(totalWords, 1500);
  const { count: animatedStreak } = useCountUp(currentStreak, 700);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        let words = 0;

        // Fetch all user stories
        const storiesQuery = query(
          collection(db, 'stories'),
          where('uid', '==', user.uid)
        );
        const storiesSnapshot = await getDocs(storiesQuery);
        storiesSnapshot.forEach((doc) => {
          const data = doc.data();
          words += data.wordCount || 0;
        });

        // Fetch all user poems
        const poemsQuery = query(
          collection(db, 'poems'),
          where('uid', '==', user.uid)
        );
        const poemsSnapshot = await getDocs(poemsQuery);
        poemsSnapshot.forEach((doc) => {
          const data = doc.data();
          words += data.wordCount || 0;
        });

        setTotalWords(words);

      } catch (error) {
        console.error('[StatsCards] Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!user) return null;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statCard}>
        <img src={iconTotalWords} alt="" className={styles.statIcon} />
        <div className={styles.statContent}>
          <div className={styles.statValue}>
            {loading ? '...' : formatNumber(animatedWords)}
          </div>
          <div className={styles.statLabel}>Total words</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <img src={iconStreak} alt="" className={styles.statIcon} />
        <div className={styles.statContent}>
          <div className={styles.statValue}>
            {(loading || activityLoading) ? '...' : `${animatedStreak} ${animatedStreak === 1 ? 'Day' : 'Days'}`}
          </div>
          <div className={styles.statLabel}>Streak</div>
        </div>
      </div>
    </div>
  );
}
