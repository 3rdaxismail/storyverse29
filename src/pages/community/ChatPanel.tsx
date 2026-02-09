import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../firebase/config";
import { useCommunityRooms } from "./useCommunityRooms";
import { ROOM_META } from "./roomMeta";
import ConfirmationToast from "../../components/common/ConfirmationToast";
import DeleteIconSvg from "../../assets/delete.svg";
import styles from "./CommunityPage.module.css";

const ChatPanel = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { rooms, activeRoomId, sendMessage, deleteMessage, editMessage } = useCommunityRooms(roomId);
  const [input, setInput] = React.useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const room = rooms.find((r) => r.id === (roomId || activeRoomId));
  const roomMeta = room ? ROOM_META[room.id] : null;

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rooms, activeRoomId]);

  if (!room || !roomMeta || !auth.currentUser) return null;

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(room.id, input.trim());
      setInput("");
    }
  };

  const handleDeleteClick = (messageId: string) => {
    setDeleteConfirmMessageId(messageId);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmMessageId) {
      try {
        await deleteMessage(room.id, deleteConfirmMessageId);
        setDeleteConfirmMessageId(null);
      } catch {
        alert("Failed to delete message. Please try again.");
        setDeleteConfirmMessageId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmMessageId(null);
  };

  const handleStartEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async (messageId: string) => {
    if (editingContent.trim() && editingContent.trim() !== "") {
      try {
        await editMessage(room.id, messageId, editingContent.trim());
        setEditingMessageId(null);
        setEditingContent("");
      } catch {
        alert("Failed to edit message. Please try again.");
      }
    }
  };

  const handleUsernameClick = (username?: string) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <section className={styles.chatSection}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <h1 className={styles.chatRoomName}>
          {roomMeta?.icon} {roomMeta?.label}
        </h1>
        {roomMeta?.description && (
          <p className={styles.chatRoomDescription}>{roomMeta.description}</p>
        )}
      </div>

      {/* Messages Area */}
      <div className={styles.messagesList}>
        {room.messages.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            No messages yet. Be the first to start the conversation!
          </div>
        ) : (
          room.messages.map((msg) => {
            const isCurrentUser = msg.senderUid === auth.currentUser?.uid;
            const isEditing = editingMessageId === msg.id;
            
            return (
              <div
                key={msg.id}
                className={
                  isCurrentUser
                    ? styles.messageRowOutgoing
                    : styles.messageRowIncoming
                }
              >
                {msg.photoURL ? (
                  <img 
                    src={msg.photoURL} 
                    alt={msg.displayName}
                    className={styles.messageAvatar}
                    style={{ cursor: msg.username ? 'pointer' : 'default' }}
                    onClick={() => handleUsernameClick(msg.username)}
                  />
                ) : (
                  <div 
                    className={styles.messageAvatar}
                    style={{ cursor: msg.username ? 'pointer' : 'default' }}
                    onClick={() => handleUsernameClick(msg.username)}
                  >
                    {(msg.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.bubble}>
                  <div className={styles.username}>
                    <span 
                      style={{ 
                        cursor: msg.username ? 'pointer' : 'default',
                        textDecoration: msg.username ? 'underline' : 'none'
                      }}
                      onClick={() => handleUsernameClick(msg.username)}
                    >
                      {msg.displayName || 'Unknown User'}
                    </span>
                    <span className={styles.time}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.edited && " (edited)"}
                    </span>
                  </div>
                  {isEditing ? (
                    <div style={{ marginTop: '0.5rem' }}>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          resize: 'vertical',
                          fontSize: '0.9rem'
                        }}
                        autoFocus
                      />
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.content}>{msg.content}</div>
                      {isCurrentUser && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleStartEdit(msg.id, msg.content)}
                            style={{
                              padding: '0.4rem',
                              fontSize: '1rem',
                              backgroundColor: 'transparent',
                              color: '#007bff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Edit message"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(msg.id)}
                            style={{
                              padding: '0.4rem',
                              fontSize: '1rem',
                              backgroundColor: 'transparent',
                              color: '#dc3545',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Delete message"
                          >
                            <img src={DeleteIconSvg} alt="Delete" style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Composer */}
      <div className={styles.composerBox}>
        <textarea
          className={styles.composerInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          rows={2}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>

      {/* Delete Confirmation Toast */}
      <ConfirmationToast
        show={deleteConfirmMessageId !== null}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </section>
  );
};

export default ChatPanel;
