import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Message, Thread } from '../types/inbox';
import { useAuth } from '../firebase/AuthContext';
import {
  getUserThreads,
  getOrCreateThread as getOrCreateThreadService,
  sendMessage as sendMessageService,
  markThreadAsRead as markThreadAsReadService,
  subscribeToUserThreads
} from '../firebase/services/messagesService';

interface InboxContextType {
  threads: Thread[];
  unreadCount: number;
  currentUser: User;
  markThreadAsRead: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  getThread: (threadId: string) => Thread | undefined;
  createOrGetThread: (otherUser: User) => Promise<string>;
  loading: boolean;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export function InboxProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  
  // Build current user from auth context
  const currentUser: User = useMemo(() => ({
    id: user?.uid || "current-user",
    name: userProfile?.displayName || "You",
    avatar: userProfile?.photoURL || "",
  }), [user?.uid, userProfile?.displayName, userProfile?.photoURL]);
  
  // Subscribe to real-time thread updates
  useEffect(() => {
    if (!user?.uid) {
      setThreads([]);
      setLoading(false);
      return;
    }
    
    console.log('[InboxContext] Subscribing to threads for user:', user.uid);
    
    const unsubscribe = subscribeToUserThreads(user.uid, (updatedThreads) => {
      console.log('[InboxContext] Received thread update:', updatedThreads.length, 'threads');
      setThreads(updatedThreads);
      setLoading(false);
    });
    
    return () => {
      console.log('[InboxContext] Unsubscribing from threads');
      unsubscribe();
    };
  }, [user?.uid]);

  // Unread count
  const unreadCount = useMemo(() =>
    threads.reduce(
      (count, thread) =>
        count + thread.messages.filter(
          (msg) => msg.receiverId === currentUser.id && !msg.read
        ).length,
      0
    ),
    [threads, currentUser.id]
  );

  // Mark thread as read
  const markThreadAsRead = useCallback(async (threadId: string) => {
    try {
      await markThreadAsReadService(threadId, currentUser.id);
    } catch (error) {
      console.error('[InboxContext] Failed to mark thread as read:', error);
    }
  }, [currentUser.id]);

  // Send message
  const sendMessage = useCallback(
    async (threadId: string, text: string) => {
      try {
        const thread = threads.find(t => t.id === threadId);
        if (!thread) {
          console.error('[InboxContext] Thread not found:', threadId);
          return;
        }
        
        const otherUser = thread.participants.find(u => u.id !== currentUser.id);
        if (!otherUser) {
          console.error('[InboxContext] Other user not found in thread');
          return;
        }
        
        await sendMessageService(threadId, currentUser.id, otherUser.id, text);
      } catch (error) {
        console.error('[InboxContext] Failed to send message:', error);
      }
    },
    [threads, currentUser.id]
  );

  // Get thread by id
  const getThread = useCallback(
    (threadId: string) => threads.find((t) => t.id === threadId),
    [threads]
  );

  // Create or get thread with a specific user
  const createOrGetThread = useCallback(
    async (otherUser: User): Promise<string> => {
      try {
        const thread = await getOrCreateThreadService(currentUser, otherUser);
        console.log('[InboxContext] Thread ready:', thread.id);
        return thread.id;
      } catch (error) {
        console.error('[InboxContext] Failed to create/get thread:', error);
        throw error;
      }
    },
    [currentUser]
  );

  const value = {
    threads,
    unreadCount,
    currentUser,
    markThreadAsRead,
    sendMessage,
    getThread,
    createOrGetThread,
    loading,
  };

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const context = useContext(InboxContext);
  if (context === undefined) {
    throw new Error('useInbox must be used within an InboxProvider');
  }
  return context;
}
