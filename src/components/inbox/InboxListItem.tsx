import React from "react";
import type { Thread, User } from "../../types/inbox";
import { Link } from "react-router-dom";
import styles from "./InboxListItem.module.css";
import { getUserAvatar } from "./getUserAvatar";

interface Props {
  thread: Thread;
  currentUser: User;
}

const InboxListItem: React.FC<Props> = ({ thread, currentUser }) => {
  const otherUser = thread.participants.find((u) => u.id !== currentUser.id)!;
  const lastMsg = thread.messages[thread.messages.length - 1];
  const unread = thread.messages.some(
    (msg) => msg.receiverId === currentUser.id && !msg.read
  );

  return (
    <Link to={`/inbox/${thread.id}`} className={styles.itemRoot + (unread ? " " + styles.unread : "")}> 
      <img src={getUserAvatar(otherUser)} alt={otherUser.name} className={styles.avatar} />
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>{otherUser.name}</span>
          <span className={styles.time}>{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className={styles.preview + (unread ? " " + styles.bold : "")}>{lastMsg.text}</div>
      </div>
      {unread && <span className={styles.unreadDot} />}
    </Link>
  );
};

export default InboxListItem;
