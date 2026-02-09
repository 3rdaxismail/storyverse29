import { useState, useCallback, useMemo } from "react";

import type { User, Message, Thread } from "../types/inbox";

// Current user placeholder - will be replaced with real auth
const currentUserPlaceholder: User = {
  id: "current-user",
  name: "You",
  avatar: "",
};

// No fake messages - start with empty inbox
const initialThreads: Thread[] = [];

export function useInboxState() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const currentUser = currentUserPlaceholder;

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
  const markThreadAsRead = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id !== threadId
          ? thread
          : {
              ...thread,
              messages: thread.messages.map((msg) =>
                msg.receiverId === currentUser.id && !msg.read
                  ? { ...msg, read: true }
                  : msg
              ),
            }
      )
    );
  }, [currentUser.id]);


  // Helper: trim messages to last 100 (by timestamp)
  function trimMessages(messages: Message[]): Message[] {
    if (messages.length <= 100) return messages;
    // Sort by timestamp ascending, keep last 100
    return messages
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-100);
  }

  // Helper: get last activity timestamp for a thread
  function getLastActivity(thread: Thread): number {
    if (!thread.messages.length) return 0;
    return Math.max(...thread.messages.map((m) => m.timestamp));
  }

  // Send message (reply)
  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      setThreads((prev) => {
        let updatedThreads = prev.map((thread) => {
          if (thread.id !== threadId) return thread;
          // Add new message
          const newMessages = [
            ...thread.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: currentUser.id,
              receiverId: thread.participants.find((u) => u.id !== currentUser.id)?.id || "",
              text,
              timestamp: Date.now(),
              read: false,
            },
          ];
          // Enforce thread message limit
          return {
            ...thread,
            messages: trimMessages(newMessages),
          };
        });
        return updatedThreads;
      });
    },
    [currentUser.id]
  );

  // Add or receive a new message (from another user, new or existing thread)
  // This is a helper for future extensibility, not used in UI yet
  const receiveMessage = useCallback(
    (fromUser: User, text: string) => {
      setThreads((prev) => {
        // Find thread with this user
        let thread = prev.find((t) => t.participants.some((u) => u.id === fromUser.id));
        let updatedThreads = [...prev];
        if (thread) {
          // Add to existing thread
          updatedThreads = updatedThreads.map((t) =>
            t.id !== thread!.id
              ? t
              : {
                  ...t,
                  messages: trimMessages([
                    ...t.messages,
                    {
                      id: `msg-${Date.now()}`,
                      senderId: fromUser.id,
                      receiverId: currentUser.id,
                      text,
                      timestamp: Date.now(),
                      read: false,
                    },
                  ]),
                }
          );
        } else {
          // New thread: enforce inbox thread limit
          let newThread: Thread = {
            id: `thread-${Date.now()}`,
            participants: [currentUser, fromUser],
            messages: [
              {
                id: `msg-${Date.now()}`,
                senderId: fromUser.id,
                receiverId: currentUser.id,
                text,
                timestamp: Date.now(),
                read: false,
              },
            ],
          };
          // If already 100 threads, evict oldest by lastActivity
          if (updatedThreads.length >= 100) {
            updatedThreads = updatedThreads
              .sort((a, b) => getLastActivity(a) - getLastActivity(b))
              .slice(1); // remove oldest
          }
          updatedThreads = [...updatedThreads, newThread];
        }
        return updatedThreads;
      });
    },
    [currentUser]
  );

  // Get thread by id
  const getThread = useCallback(
    (threadId: string) => threads.find((t) => t.id === threadId),
    [threads]
  );

  // Create or get thread with a specific user
  const createOrGetThread = useCallback(
    (otherUser: User): string => {
      // Find existing thread with this user
      const existingThread = threads.find((t) => 
        t.participants.some((u) => u.id === otherUser.id)
      );
      
      if (existingThread) {
        return existingThread.id;
      }
      
      // Create new thread
      const newThreadId = `thread-${Date.now()}`;
      const newThread: Thread = {
        id: newThreadId,
        participants: [currentUser, otherUser],
        messages: [],
      };
      
      setThreads((prev) => {
        let updatedThreads = [...prev, newThread];
        // Enforce thread limit
        if (updatedThreads.length > 100) {
          updatedThreads = updatedThreads
            .sort((a, b) => getLastActivity(a) - getLastActivity(b))
            .slice(1); // remove oldest
        }
        return updatedThreads;
      });
      
      return newThreadId;
    },
    [threads, currentUser]
  );

  return {
    threads,
    unreadCount,
    markThreadAsRead,
    sendMessage,
    getThread,
    createOrGetThread,
    currentUser,
  };
}
