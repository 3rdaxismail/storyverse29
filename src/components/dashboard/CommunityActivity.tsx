/**
 * CommunityActivity Component
 * Displays latest messages from all community rooms
 * Auto-updates when new messages arrive
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../firebase/AuthContext';
import { ROOM_META } from '../../pages/community/roomMeta';
import communityIcon from '../../assets/community_read.svg';
import styles from './CommunityActivity.module.css';

interface RecentMessage {
  id: string;
  roomId: string;
  roomName: string;
  roomIcon: string;
  content: string;
  displayName: string;
  timestamp: number;
}

export default function CommunityActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every minute for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // Subscribe to each room's latest messages
    Object.keys(ROOM_META).forEach((roomId) => {
      const messagesRef = collection(db, `communityRooms/${roomId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(3));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const messages: RecentMessage[] = [];
        const authorCache = new Map<string, string>();

        // Helper to get author's display name
        const getAuthorName = async (senderUid: string): Promise<string> => {
          if (authorCache.has(senderUid)) {
            return authorCache.get(senderUid)!;
          }

          try {
            const userDocRef = doc(db, 'users', senderUid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const displayName = userDoc.data().displayName || 'Anonymous';
              authorCache.set(senderUid, displayName);
              return displayName;
            }
          } catch (error) {
            console.error('[CommunityActivity] Error fetching author:', error);
          }

          return 'Anonymous';
        };

        // Process messages and fetch author names
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          
          // Get displayName from message doc or fetch from user profile
          let displayName = data.displayName || 'Anonymous';
          if (!data.displayName && data.senderUid) {
            displayName = await getAuthorName(data.senderUid);
          }

          messages.push({
            id: docSnap.id,
            roomId,
            roomName: ROOM_META[roomId]?.label || roomId,
            roomIcon: ROOM_META[roomId]?.icon || '💬',
            content: data.content || '',
            displayName,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toMillis() 
              : Date.now(),
          });
        }

        // Update recent messages - merge all rooms and sort by timestamp
        setRecentMessages((prev) => {
          // Remove old messages from this room
          const filtered = prev.filter((msg) => msg.roomId !== roomId);
          // Add new messages
          const updated = [...filtered, ...messages];
          // Sort by timestamp descending
          return updated.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
        });

        setLoading(false);
      });

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user]);

  // Auto-rotate messages every 5 seconds
  useEffect(() => {
    if (recentMessages.length === 0) return;

    const rotationInterval = setInterval(() => {
      setFade(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % recentMessages.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(rotationInterval);
  }, [recentMessages.length]);

  if (!user || loading) return null;

  if (recentMessages.length === 0) {
    return null;
  }

  const truncateContent = (content: string, maxLength: number = 30): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const currentMessage = recentMessages[currentIndex];

  return (
    <div 
      className={styles.communityCard}
      onClick={() => navigate('/community', { state: { openDrawer: true } })}
      role="button"
      tabIndex={0}
    >
      <img src={communityIcon} alt="" className={styles.icon} />
      <span className={`${styles.content} ${fade ? styles.fadeIn : styles.fadeOut}`}>
        <strong>{currentMessage.roomName}:</strong> "{truncateContent(currentMessage.content)}"
      </span>
    </div>
  );
}
