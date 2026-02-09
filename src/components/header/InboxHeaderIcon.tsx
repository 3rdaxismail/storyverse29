import React from "react";
import { useInbox } from "../../contexts/InboxContext";
import messageUnreadIcon from "../../assets/message_unread.svg";
import messageReadIcon from "../../assets/message_read.svg";
import styles from "./InboxHeaderIcon.module.css";
import { useNavigate } from "react-router-dom";

const InboxHeaderIcon: React.FC = () => {
  const { unreadCount } = useInbox();
  const navigate = useNavigate();
  const hasUnread = unreadCount > 0;

  return (
    <button
      className={styles.inboxButton}
      aria-label={hasUnread ? "Unread messages" : "Messages"}
      onClick={() => navigate("/inbox")}
    >
      <img
        src={hasUnread ? messageUnreadIcon : messageReadIcon}
        alt="Inbox"
        className={styles.inboxIcon}
      />
      {hasUnread && (
        <span className={styles.badge}>{unreadCount}</span>
      )}
    </button>
  );
};

export default InboxHeaderIcon;
