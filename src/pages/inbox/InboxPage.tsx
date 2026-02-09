import React, { useState } from "react";
import { useInbox } from "../../contexts/InboxContext";
import styles from "./InboxPage.module.css";
import InboxListItem from "../../components/inbox/InboxListItem";
import BottomNavigation from "../../components/navigation/BottomNavigation";

const InboxPage: React.FC = () => {
  const { threads, currentUser } = useInbox();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = threads.filter(thread => 
    thread.messages.some(msg => msg.receiverId === currentUser.id && !msg.read)
  ).length;

  const filteredThreads = filter === 'unread' 
    ? threads.filter(thread => thread.messages.some(msg => msg.receiverId === currentUser.id && !msg.read))
    : threads;

  return (
    <div className={styles.inboxPageRoot}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Messages</h1>
          {unreadCount > 0 && (
            <div className={styles.unreadBadge}>
              {unreadCount} unread
            </div>
          )}
        </div>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Messages
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
        </div>
      </div>
      <div className={styles.threadList}>
        {filteredThreads.length === 0 ? (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className={styles.emptyTitle}>
              {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
            </p>
            <p className={styles.emptySubtext}>
              {filter === 'unread' 
                ? 'All caught up! Check back later for new messages.'
                : 'Start connecting with other writers in the community.'}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <InboxListItem
              key={thread.id}
              thread={thread}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
      <BottomNavigation activeTab="inbox" />
    </div>
  );
};

export default InboxPage;
