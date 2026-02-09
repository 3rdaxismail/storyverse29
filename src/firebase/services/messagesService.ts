import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config';
import type { Thread, Message, User } from '../../types/inbox';

const THREADS_COLLECTION = 'messageThreads';
const MAX_MESSAGES_PER_THREAD = 100;

// Convert Firestore timestamp to number
function timestampToNumber(timestamp: any): number {
  if (timestamp?.toMillis) {
    return timestamp.toMillis();
  }
  if (timestamp?.seconds) {
    return timestamp.seconds * 1000;
  }
  return timestamp || Date.now();
}

/**
 * Create a thread ID from two user IDs (always in sorted order for consistency)
 */
function createThreadId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `thread_${sorted[0]}_${sorted[1]}`;
}

/**
 * Get or create a thread between two users
 */
export async function getOrCreateThread(currentUser: User, otherUser: User): Promise<Thread> {
  const threadId = createThreadId(currentUser.id, otherUser.id);
  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  
  const threadSnap = await getDoc(threadRef);
  
  if (threadSnap.exists()) {
    const data = threadSnap.data();
    return {
      id: threadSnap.id,
      participants: data.participants,
      messages: (data.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: timestampToNumber(msg.timestamp)
      }))
    };
  }
  
  // Create new thread
  const newThread: Thread = {
    id: threadId,
    participants: [currentUser, otherUser],
    messages: []
  };
  
  await setDoc(threadRef, {
    participants: [currentUser, otherUser],
    participantIds: [currentUser.id, otherUser.id],
    messages: [],
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp()
  });
  
  return newThread;
}

/**
 * Get all threads for a user
 */
export async function getUserThreads(userId: string): Promise<Thread[]> {
  const threadsQuery = query(
    collection(db, THREADS_COLLECTION),
    where('participantIds', 'array-contains', userId)
  );
  
  const snapshot = await getDocs(threadsQuery);
  const threads: Thread[] = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    threads.push({
      id: doc.id,
      participants: data.participants,
      messages: (data.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: timestampToNumber(msg.timestamp)
      }))
    });
  });
  
  // Sort by last message time
  threads.sort((a, b) => {
    const aLast = a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : 0;
    const bLast = b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : 0;
    return bLast - aLast;
  });
  
  return threads;
}

/**
 * Send a message in a thread
 */
export async function sendMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<void> {
  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const threadSnap = await getDoc(threadRef);
  
  if (!threadSnap.exists()) {
    throw new Error('Thread not found');
  }
  
  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    receiverId,
    text,
    timestamp: Date.now(),
    read: false
  };
  
  const data = threadSnap.data();
  const currentMessages = data.messages || [];
  
  // Keep only the last MAX_MESSAGES_PER_THREAD messages
  let updatedMessages = [...currentMessages, {
    ...newMessage,
    timestamp: Timestamp.now()
  }];
  
  if (updatedMessages.length > MAX_MESSAGES_PER_THREAD) {
    updatedMessages = updatedMessages.slice(-MAX_MESSAGES_PER_THREAD);
  }
  
  await updateDoc(threadRef, {
    messages: updatedMessages,
    lastMessageAt: serverTimestamp()
  });
}

/**
 * Mark all messages in a thread as read for the current user
 */
export async function markThreadAsRead(threadId: string, userId: string): Promise<void> {
  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const threadSnap = await getDoc(threadRef);
  
  if (!threadSnap.exists()) {
    return;
  }
  
  const data = threadSnap.data();
  const messages = data.messages || [];
  
  const updatedMessages = messages.map((msg: any) => {
    if (msg.receiverId === userId && !msg.read) {
      return { ...msg, read: true };
    }
    return msg;
  });
  
  await updateDoc(threadRef, {
    messages: updatedMessages
  });
}

/**
 * Subscribe to thread updates (real-time)
 */
export function subscribeToUserThreads(
  userId: string,
  callback: (threads: Thread[]) => void
): () => void {
  const threadsQuery = query(
    collection(db, THREADS_COLLECTION),
    where('participantIds', 'array-contains', userId)
  );
  
  return onSnapshot(threadsQuery, (snapshot) => {
    const threads: Thread[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      threads.push({
        id: doc.id,
        participants: data.participants,
        messages: (data.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: timestampToNumber(msg.timestamp)
        }))
      });
    });
    
    // Sort by last message time
    threads.sort((a, b) => {
      const aLast = a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : 0;
      const bLast = b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : 0;
      return bLast - aLast;
    });
    
    callback(threads);
  });
}
