/**
 * RecentlyEdited Component
 * Shows the ONE most recently edited story or poem for the current user
 * Uses existing StoryCard component with no delete button
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../firebase/AuthContext';
import StoryCard from '../cards/StoryCard';
import styles from './RecentlyEdited.module.css';

interface RecentlyEditedItem {
  id: string;
  title: string;
  coverImageUrl: string;
  genre: string;
  likes: number;
  comments: number;
  wordCount: number;
  readingTime: number;
  type: 'story' | 'poem';
  updatedAt: Date;
}

export default function RecentlyEdited() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<RecentlyEditedItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchRecentlyEdited = async () => {
      try {
        let mostRecentItem: RecentlyEditedItem | null = null;

        // Fetch most recently edited story
        try {
          const storiesQuery = query(
            collection(db, 'stories'),
            where('uid', '==', user.uid),
            orderBy('updatedAt', 'desc'),
            limit(1)
          );
          const storiesSnapshot = await getDocs(storiesQuery);
          
          if (!storiesSnapshot.empty) {
            const doc = storiesSnapshot.docs[0];
            const data = doc.data();
            mostRecentItem = {
              id: doc.id,
              title: data.storyTitle || 'Untitled Story',
              coverImageUrl: data.coverImageUrl || '',
              genre: data.genre || 'Fiction',
              likes: data.likes || 0,
              comments: data.comments || 0,
              wordCount: data.wordCount || 0,
              readingTime: Math.ceil((data.wordCount || 0) / 200),
              type: 'story',
              updatedAt: data.updatedAt?.toDate() || new Date(0)
            };
          }
        } catch (storiesError) {
          console.error('[RecentlyEdited] Error fetching stories:', storiesError);
        }

        // Fetch most recently edited poem
        try {
          const poemsQuery = query(
            collection(db, 'poems'),
            where('uid', '==', user.uid),
            orderBy('updatedAt', 'desc'),
            limit(1)
          );
          const poemsSnapshot = await getDocs(poemsQuery);
          
          if (!poemsSnapshot.empty) {
            const doc = poemsSnapshot.docs[0];
            const data = doc.data();
            const poemItem: RecentlyEditedItem = {
              id: doc.id,
              title: data.poemTitle || 'Untitled Poem',
              coverImageUrl: data.coverImageUrl || '',
              genre: data.genre || 'Poetry',
              likes: data.likes || 0,
              comments: data.comments || 0,
              wordCount: data.wordCount || 0,
              readingTime: Math.ceil((data.wordCount || 0) / 200),
              type: 'poem',
              updatedAt: data.updatedAt?.toDate() || new Date(0)
            };

            // Compare: use the newer one
            if (!mostRecentItem || poemItem.updatedAt > mostRecentItem.updatedAt) {
              mostRecentItem = poemItem;
            }
          }
        } catch (poemsError) {
          console.error('[RecentlyEdited] Error fetching poems:', poemsError);
        }

        setItem(mostRecentItem);
      } catch (error) {
        console.error('[RecentlyEdited] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyEdited();
  }, [user?.uid]);

  const handleCardClick = (id: string) => {
    if (!item) return;
    
    if (item.type === 'story') {
      navigate(`/editor/story/${id}`);
    } else if (item.type === 'poem') {
      navigate(`/poem/editor?id=${id}`);
    }
  };

  // Empty state - when loaded but no items
  if (!loading && !item) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>No edits yet. Start writing to see activity here.</p>
      </div>
    );
  }

  // Loading state - show placeholder
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.heading}>Recently edited</h3>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show the recently edited card
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.heading}>Recently edited</h3>
      </div>
      
      {item && (
        <StoryCard
          id={item.id}
          title={item.title}
          coverImageUrl={item.coverImageUrl}
          genre={item.genre}
          likes={item.likes}
          comments={item.comments}
          wordCount={item.wordCount}
          readingTime={item.readingTime}
          type={item.type}
          onClick={handleCardClick}
          showDelete={false}
        />
      )}
    </div>
  );
}
