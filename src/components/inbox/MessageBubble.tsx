import React from "react";
import type { Message, User } from "../../types/inbox";
import styles from "./MessageBubble.module.css";
import { getUserAvatar } from "./getUserAvatar";

interface Props {
  message: Message;
  isOutgoing: boolean;
  user: User;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

const MessageBubble: React.FC<Props> = ({ 
  message, 
  isOutgoing, 
  user,
  showAvatar = true,
  showTimestamp = true
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {showTimestamp && (
        <div className={styles.timestamp}>
          {formatTime(message.timestamp)}
        </div>
      )}
      <div className={isOutgoing ? styles.bubbleRowOutgoing : styles.bubbleRowIncoming}>
        <div className={styles.avatarContainer}>
          {showAvatar ? (
            <img 
              src={getUserAvatar(user)} 
              alt={user.name} 
              className={styles.avatar} 
            />
          ) : (
            <div className={styles.avatarSpacer} />
          )}
        </div>
        <div className={isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming}>
          {showAvatar && !isOutgoing && (
            <div className={styles.userName}>{user.name}</div>
          )}
          <div className={styles.text}>{message.text}</div>
          <div className={styles.messageFooter}>
            <div className={styles.time}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {isOutgoing && message.read && (
              <div className={styles.readReceipt} title="Read">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBubble;
