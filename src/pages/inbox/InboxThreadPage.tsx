import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInbox } from "../../contexts/InboxContext";
import styles from "./InboxThreadPage.module.css";
import MessageBubble from "../../components/inbox/MessageBubble";
import { getUserAvatar } from "../../components/inbox/getUserAvatar";
import BottomNavigation from "../../components/navigation/BottomNavigation";

const InboxThreadPage: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { getThread, markThreadAsRead, sendMessage, currentUser } = useInbox();
  const thread = threadId ? getThread(threadId) : undefined;
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (threadId) markThreadAsRead(threadId);
  }, [threadId, markThreadAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  const handleSend = () => {
    if (reply.trim() && thread) {
      sendMessage(thread.id, reply.trim());
      setReply("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  if (!thread) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFound}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2>Thread not found</h2>
          <p>This conversation doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/inbox')} className={styles.backButton}>
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  const otherUser = thread.participants.find((u) => u.id !== currentUser.id);

  return (
    <div className={styles.threadPageRoot}>
      {/* Thread Header */}
      <div className={styles.threadHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/inbox')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className={styles.headerUser}>
          {otherUser && (
            <>
              <img 
                src={getUserAvatar(otherUser)} 
                alt={otherUser.name} 
                className={styles.headerAvatar} 
              />
              <div className={styles.headerInfo}>
                <h2 className={styles.headerName}>{otherUser.name}</h2>
                <p className={styles.headerStatus}>Active now</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {thread.messages.map((msg, index) => {
          const prevMsg = index > 0 ? thread.messages[index - 1] : null;
          const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
          const showTimestamp = !prevMsg || 
            new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 300000; // 5 minutes
          
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOutgoing={msg.senderId === currentUser.id}
              user={thread.participants.find((u) => u.id === msg.senderId)!}
              showAvatar={showAvatar}
              showTimestamp={showTimestamp}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Box */}
      <div className={styles.replyBox}>
        <div className={styles.replyInputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.replyInput}
            value={reply}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
          />
          <button 
            className={styles.sendButton} 
            onClick={handleSend} 
            disabled={!reply.trim()}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
      <BottomNavigation activeTab="inbox" />
    </div>
  );
};

export default InboxThreadPage;
