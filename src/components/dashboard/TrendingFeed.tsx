/**
 * TrendingFeed Component
 * SINGLE rotating feed row - exactly like Community feed
 * Shows ONE trending item at a time, auto-rotates every 5 seconds
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import trendingIcon from '../../assets/trending_read.svg';
import styles from './TrendingFeed.module.css';

interface TrendingItem {
  id: string;
  title: string;
  type: 'story' | 'poem';
  createdAt: Date;
}

export default function TrendingFeed() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch trending content
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trendingItems: TrendingItem[] = [];

        // Fetch trending stories (privacy = 'Trending')
        try {
          const storiesQuery = query(
            collection(db, 'stories'),
            where('privacy', '==', 'Trending'),
            limit(10)
          );
          const storiesSnapshot = await getDocs(storiesQuery);
          for (const docSnap of storiesSnapshot.docs) {
            const data = docSnap.data();
            trendingItems.push({
              id: docSnap.id,
              title: data.storyTitle || 'Untitled Story',
              type: 'story',
              createdAt: data.createdAt?.toDate() || new Date(0)
            });
          }
        } catch (storiesError) {
          console.error('[TrendingFeed] ERROR fetching stories:', storiesError);
        }

        // Fetch trending poems (privacy = 'Trending')
        try {
          const poemsQuery = query(
            collection(db, 'poems'),
            where('privacy', '==', 'Trending'),
            limit(10)
          );
          const poemsSnapshot = await getDocs(poemsQuery);
          for (const docSnap of poemsSnapshot.docs) {
            const data = docSnap.data();
            trendingItems.push({
              id: docSnap.id,
              title: data.title || 'Untitled Poem',
              type: 'poem',
              createdAt: data.createdAt?.toDate() || new Date(0)
            });
          }
        } catch (poemsError) {
          console.error('[TrendingFeed] ERROR fetching poems:', poemsError);
        }

        // Sort by date: newest first
        trendingItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        // Take top 10
        setItems(trendingItems.slice(0, 10));
      } catch (error) {
        console.error('[TrendingFeed] Error fetching trending:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Auto-rotate items every 5 seconds (exactly like Community feed)
  useEffect(() => {
    if (items.length === 0) return;

    const rotationInterval = setInterval(() => {
      setFade(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(rotationInterval);
  }, [items.length]);

  if (loading || items.length === 0) {
    return null;
  }

  // Get the SINGLE current item to display
  const currentItem = items[currentIndex];

  const handleClick = () => {
    // Navigate to trending page
    navigate('/trending');
  };

  // SINGLE ROW - exactly like Community feed
  return (
    <div 
      className={styles.trendingRow}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <img src={trendingIcon} alt="" className={styles.icon} />
      <span className={`${styles.content} ${fade ? styles.fadeIn : styles.fadeOut}`}>
        {currentItem.title}
      </span>
      <span className={styles.typeTag}>{currentItem.type.toUpperCase()}</span>
    </div>
  );
}
